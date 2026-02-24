import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Item, TabType, ConsumptionRate } from '../types/item'
import { calculateNextRemindDate, calculateTab, learnCycleDays } from '../services/reminder'
import { cleanupTrash } from '../services/trashCleanup'
import { loadAndMigrateV1Data } from '../services/migration'
import { getInitialTab } from '../constants/consumptionRate'
import { syncItemToFirestore, deleteItemFromFirestore } from '../services/sync'
import { useSyncStore } from './syncStore'

interface ItemStore {
  items: Item[]
  _migrationChecked: boolean

  // 初期化
  checkMigration: () => void

  // CRUD
  addItem: (data: {
    name: string
    imageUrl?: string | null
    barcode?: string | null
    purchasePlace?: string | null
    consumptionRate: ConsumptionRate
    memo?: string | null
  }) => void
  updateItem: (id: string, updates: Partial<Pick<Item, 'name' | 'imageUrl' | 'barcode' | 'purchasePlace' | 'consumptionRate' | 'memo'>>) => void
  deleteItem: (id: string) => void
  restoreItem: (id: string) => void
  permanentDelete: (id: string) => void

  // タブ操作
  moveToTab: (id: string, tab: TabType) => void
  toggleStar: (id: string) => void

  // 買った！
  markAsBought: (id: string) => void
  undoBought: (id: string, previousCheckHistory: Item['checkHistory'], previousTab: TabType) => void

  // メンテナンス
  recalculateAllTabs: () => void
  runTrashCleanup: () => void

  // ヘルパー
  getItemsByTab: (tab: TabType) => Item[]
  getPurchasePlaces: () => string[]
}

export const useItemStore = create<ItemStore>()(
  persist(
    (set, get) => ({
      items: [],
      _migrationChecked: false,

      checkMigration: () => {
        if (get()._migrationChecked) return
        const migrated = loadAndMigrateV1Data()
        if (migrated.length > 0) {
          set((state) => ({
            items: [...state.items, ...migrated],
            _migrationChecked: true,
          }))
        } else {
          set({ _migrationChecked: true })
        }
      },

      addItem: (data) => {
        const now = new Date().toISOString()
        const syncState = useSyncStore.getState()
        const item: Item = {
          id: crypto.randomUUID(),
          userId: syncState.userId,
          familyGroupId: syncState.familyGroupId,
          name: data.name,
          imageUrl: data.imageUrl ?? null,
          barcode: data.barcode ?? null,
          purchasePlace: data.purchasePlace ?? null,
          consumptionRate: data.consumptionRate,
          memo: data.memo ?? null,
          isStarred: false,
          currentTab: getInitialTab(data.consumptionRate),
          createdAt: now,
          updatedAt: now,
          trashedAt: null,
          checkHistory: [],
          nextRemindDate: calculateNextRemindDate({
            consumptionRate: data.consumptionRate,
            checkHistory: [],
            createdAt: now,
          }),
        }
        set((state) => ({ items: [...state.items, item] }))
        syncItemToFirestore(item)
      },

      updateItem: (id, updates) => {
        const now = new Date().toISOString()
        let updatedItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const updated = { ...item, ...updates, updatedAt: now }
            // consumptionRateが変わったらnextRemindDateを再計算
            if (updates.consumptionRate && updates.consumptionRate !== item.consumptionRate) {
              updated.nextRemindDate = calculateNextRemindDate(updated)
              updated.currentTab = calculateTab(updated)
            }
            updatedItem = updated
            return updated
          }),
        }))
        if (updatedItem) syncItemToFirestore(updatedItem)
      },

      deleteItem: (id) => {
        const now = new Date().toISOString()
        let trashedItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const updated = { ...item, trashedAt: now, isStarred: false, currentTab: 'TRASH' as TabType, updatedAt: now }
            trashedItem = updated
            return updated
          }),
        }))
        if (trashedItem) syncItemToFirestore(trashedItem)
      },

      restoreItem: (id) => {
        const now = new Date().toISOString()
        let restoredItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const restored = { ...item, trashedAt: null, updatedAt: now }
            restored.currentTab = calculateTab(restored)
            restoredItem = restored
            return restored
          }),
        }))
        if (restoredItem) syncItemToFirestore(restoredItem)
      },

      permanentDelete: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
        deleteItemFromFirestore(id)
      },

      moveToTab: (id, tab) => {
        const now = new Date().toISOString()
        let movedItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const isMovingToStar = tab === 'STAR'
            const updated = { ...item, currentTab: tab, updatedAt: now }
            if (isMovingToStar) {
              updated.isStarred = true
            } else if (item.isStarred) {
              updated.isStarred = false
            }
            if (tab === 'TRASH') {
              updated.trashedAt = now
            } else if (item.trashedAt) {
              updated.trashedAt = null
            }
            movedItem = updated
            return updated
          }),
        }))
        if (movedItem) syncItemToFirestore(movedItem)
      },

      toggleStar: (id) => {
        const now = new Date().toISOString()
        let starredItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const newStarred = !item.isStarred
            const updated = { ...item, isStarred: newStarred, updatedAt: now }
            updated.currentTab = calculateTab(updated)
            starredItem = updated
            return updated
          }),
        }))
        if (starredItem) syncItemToFirestore(starredItem)
      },

      markAsBought: (id) => {
        const now = new Date().toISOString()
        let boughtItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const newHistory = [...item.checkHistory, { checkedAt: now }]
            const updated = { ...item, checkHistory: newHistory, updatedAt: now }

            // 学習: 2回以上チェックしていたら消費サイクルを自動更新
            const learned = learnCycleDays(newHistory)
            if (learned !== null) {
              if (learned <= 45) updated.consumptionRate = 'FREQUENT'
              else if (learned <= 105) updated.consumptionRate = 'OCCASIONAL'
              else updated.consumptionRate = 'STOCKPILE'
            }

            updated.nextRemindDate = calculateNextRemindDate(updated)
            updated.currentTab = calculateTab(updated)
            boughtItem = updated
            return updated
          }),
        }))
        if (boughtItem) syncItemToFirestore(boughtItem)
      },

      undoBought: (id, previousCheckHistory, previousTab) => {
        const now = new Date().toISOString()
        let undoneItem: Item | null = null
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const updated = { ...item, checkHistory: previousCheckHistory, currentTab: previousTab, updatedAt: now }
            undoneItem = updated
            return updated
          }),
        }))
        if (undoneItem) syncItemToFirestore(undoneItem)
      },

      recalculateAllTabs: () => {
        set((state) => ({
          items: state.items.map((item) => ({
            ...item,
            currentTab: calculateTab(item),
          })),
        }))
      },

      runTrashCleanup: () => {
        set((state) => ({ items: cleanupTrash(state.items) }))
      },

      getItemsByTab: (tab) => {
        return get().items.filter((item) => item.currentTab === tab)
      },

      getPurchasePlaces: () => {
        const places = get()
          .items.map((item) => item.purchasePlace)
          .filter((p): p is string => !!p)
        return [...new Set(places)]
      },
    }),
    {
      name: 'kaitas-v2-items',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
