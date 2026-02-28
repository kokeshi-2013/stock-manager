import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShoppingList } from '../types/list'
import { DEFAULT_LIST_NAME, MAX_LIST_COUNT } from '../types/list'
import { useSyncStore } from './syncStore'

interface ListStore {
  /** 全リスト */
  lists: ShoppingList[]
  /** 現在選択中のリストID */
  activeListId: string | null
  /** この端末のID（リスト名に使用: 「○○のリスト」） */
  deviceId: string

  // === リストCRUD ===
  /** 初回起動時にデフォルトリストを作成 */
  ensureDefaultList: () => string
  /** 新しいリストを作成 */
  createList: (name: string) => ShoppingList | null
  /** リスト名を変更 */
  renameList: (listId: string, newName: string) => void
  /** リストを削除 */
  deleteList: (listId: string) => void
  /** リストを選択 */
  setActiveListId: (listId: string) => void

  // === 共有関連 ===
  /** 共有コードを設定 */
  setShareCode: (listId: string, code: string) => void
  /** メンバーを追加 */
  addMember: (listId: string, uid: string) => void

  // === 同期関連 ===
  /** クラウドからリストをマージ（重複はスキップ） */
  mergeListsFromCloud: (cloudLists: ShoppingList[]) => void
  /** リスト全体を上書き（特定リストのクラウドデータで更新） */
  updateListFromCloud: (list: ShoppingList) => void
  /** UID変更時にownerUidとmemberUidsを更新 */
  updateOwnerUid: (oldUid: string, newUid: string) => void

  // === ヘルパー ===
  /** アクティブリストを取得 */
  getActiveList: () => ShoppingList | undefined
  /** 特定UIDがメンバーのリスト一覧 */
  getListsForUser: (uid: string) => ShoppingList[]
  /** IDでリストを取得 */
  getListById: (listId: string) => ShoppingList | undefined
}

export const useListStore = create<ListStore>()(
  persist(
    (set, get) => ({
      lists: [],
      activeListId: null,
      deviceId: crypto.randomUUID().slice(0, 8),

      ensureDefaultList: () => {
        const { lists } = get()
        if (lists.length > 0) {
          // 既にリストがあるなら最初のリストを返す
          const activeId = get().activeListId ?? lists[0].id
          set({ activeListId: activeId })
          return activeId
        }

        // デフォルトリストを作成
        const userId = useSyncStore.getState().userId
        const now = new Date().toISOString()
        const list: ShoppingList = {
          id: crypto.randomUUID(),
          name: DEFAULT_LIST_NAME,
          ownerUid: userId,
          memberUids: [userId],
          shareCode: null,
          createdAt: now,
          updatedAt: now,
        }
        set({ lists: [list], activeListId: list.id })
        return list.id
      },

      createList: (name) => {
        const { lists } = get()
        if (lists.length >= MAX_LIST_COUNT) return null

        const userId = useSyncStore.getState().userId
        const now = new Date().toISOString()
        const list: ShoppingList = {
          id: crypto.randomUUID(),
          name: name.trim() || DEFAULT_LIST_NAME,
          ownerUid: userId,
          memberUids: [userId],
          shareCode: null,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          lists: [...state.lists, list],
          activeListId: list.id,
        }))
        return list
      },

      renameList: (listId, newName) => {
        const now = new Date().toISOString()
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, name: newName.trim(), updatedAt: now } : l
          ),
        }))
      },

      deleteList: (listId) => {
        set((state) => {
          const remaining = state.lists.filter((l) => l.id !== listId)
          const newActiveId =
            state.activeListId === listId
              ? remaining[0]?.id ?? null
              : state.activeListId
          return { lists: remaining, activeListId: newActiveId }
        })
      },

      setActiveListId: (listId) => {
        set({ activeListId: listId })
      },

      setShareCode: (listId, code) => {
        const now = new Date().toISOString()
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, shareCode: code, updatedAt: now } : l
          ),
        }))
      },

      addMember: (listId, uid) => {
        const now = new Date().toISOString()
        set((state) => ({
          lists: state.lists.map((l) => {
            if (l.id !== listId) return l
            if (l.memberUids.includes(uid)) return l
            return { ...l, memberUids: [...l.memberUids, uid], updatedAt: now }
          }),
        }))
      },

      mergeListsFromCloud: (cloudLists) => {
        set((state) => {
          const existingIds = new Set(state.lists.map((l) => l.id))
          const newLists = cloudLists.filter((cl) => !existingIds.has(cl.id))
          // 既存リストはクラウドの方が新しければ更新
          const updatedLists = state.lists.map((local) => {
            const cloud = cloudLists.find((cl) => cl.id === local.id)
            if (!cloud) return local
            // updatedAtが新しい方を採用
            return cloud.updatedAt > local.updatedAt ? cloud : local
          })
          return { lists: [...updatedLists, ...newLists] }
        })
      },

      updateListFromCloud: (list) => {
        set((state) => {
          const exists = state.lists.some((l) => l.id === list.id)
          if (exists) {
            return {
              lists: state.lists.map((l) => (l.id === list.id ? list : l)),
            }
          }
          return { lists: [...state.lists, list] }
        })
      },

      updateOwnerUid: (oldUid, newUid) => {
        set((state) => ({
          lists: state.lists.map((l) => ({
            ...l,
            ownerUid: l.ownerUid === oldUid ? newUid : l.ownerUid,
            memberUids: l.memberUids.map((uid) => (uid === oldUid ? newUid : uid)),
            updatedAt: new Date().toISOString(),
          })),
        }))
      },

      getActiveList: () => {
        const { lists, activeListId } = get()
        return lists.find((l) => l.id === activeListId)
      },

      getListsForUser: (uid) => {
        return get().lists.filter((l) => l.memberUids.includes(uid))
      },

      getListById: (listId) => {
        return get().lists.find((l) => l.id === listId)
      },
    }),
    {
      name: 'kaitas-v3-lists',
      partialize: (state) => ({
        lists: state.lists,
        activeListId: state.activeListId,
        deviceId: state.deviceId,
      }),
    }
  )
)
