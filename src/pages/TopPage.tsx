import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '../components/common/Icon'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useItemStore } from '../store/itemStore'
import { useUIStore } from '../store/uiStore'
import { TABS } from '../constants/tabs'
import { Header } from '../components/common/Header'
import { TabBar } from '../components/common/TabBar'
import { SearchBar } from '../components/common/SearchBar'
import { Snackbar } from '../components/common/Snackbar'
import { ItemList } from '../components/item/ItemList'
import { ItemCard } from '../components/item/ItemCard'
import { ItemFormModal } from '../components/item/ItemFormModal'
import { PendingItemsBanner } from '../components/common/PendingItemsBanner'
import { InstallPrompt } from '../components/pwa/InstallPrompt'
import type { TabType } from '../types/item'

export default function TopPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrollingByTabRef = useRef(false)
  const isInitialRenderRef = useRef(true)

  // モーダル状態
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const checkMigration = useItemStore((s) => s.checkMigration)
  const recalculateAllTabs = useItemStore((s) => s.recalculateAllTabs)
  const runTrashCleanup = useItemStore((s) => s.runTrashCleanup)
  const markAsBought = useItemStore((s) => s.markAsBought)
  const moveToTab = useItemStore((s) => s.moveToTab)
  const items = useItemStore((s) => s.items)

  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const showSnackbar = useUIStore((s) => s.showSnackbar)
  const draggingItemId = useUIStore((s) => s.draggingItemId)
  const setDraggingItemId = useUIStore((s) => s.setDraggingItemId)

  // 初回：データ移行 + タブ再計算 + ゴミ箱掃除
  useEffect(() => {
    checkMigration()
    recalculateAllTabs()
    runTrashCleanup()
  }, [])

  // URLパラメータから「追加リクエスト」を待ちリストに保存
  // Siri / Google アシスタントから ?add=商品名 でアクセスされた場合
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const addNames = params.getAll('add')
    if (addNames.length > 0) {
      const existing = JSON.parse(localStorage.getItem('kaitas-pending-items') || '[]')
      const newItems = addNames.map(name => ({
        name: name.trim(),
        addedAt: new Date().toISOString(),
      }))
      localStorage.setItem('kaitas-pending-items', JSON.stringify([...existing, ...newItems]))
      // URLをきれいにする（ブラウザ履歴を汚さない）
      window.history.replaceState({}, '', '/app')
    }
  }, [])

  // タブ切り替え時にスクロール（修正1: スクロール中フラグで handleScroll を制御）
  const tabIndex = TABS.findIndex((t) => t.type === activeTab)
  useEffect(() => {
    if (scrollRef.current) {
      isScrollingByTabRef.current = true
      const behavior = isInitialRenderRef.current ? 'instant' as const : 'smooth' as const
      isInitialRenderRef.current = false
      scrollRef.current.scrollTo({
        left: tabIndex * scrollRef.current.clientWidth,
        behavior,
      })
      // scrollend イベントでフラグを解除（未対応ブラウザ向け600msフォールバック）
      const el = scrollRef.current
      const reset = () => {
        isScrollingByTabRef.current = false
        el.removeEventListener('scrollend', reset)
      }
      el.addEventListener('scrollend', reset, { once: true })
      setTimeout(reset, 600)
    }
  }, [tabIndex])

  // スワイプでタブ切り替え（修正1: タブクリック中はスキップ）
  const handleScroll = () => {
    if (!scrollRef.current) return
    if (isScrollingByTabRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const newIndex = Math.round(scrollLeft / clientWidth)
    if (newIndex >= 0 && newIndex < TABS.length && TABS[newIndex].type !== activeTab) {
      setActiveTab(TABS[newIndex].type)
    }
  }

  // 「買った！」処理
  const handleCheckItem = useCallback((id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const prevHistory = [...item.checkHistory]
    const prevTab = item.currentTab

    markAsBought(id)
    showSnackbar(`${item.name}を買った！に記録しました`, () => {
      useItemStore.getState().undoBought(id, prevHistory, prevTab)
    })
  }, [items, markAsBought, showSnackbar])

  // アイテム編集モーダルを開く
  const handleEditItem = useCallback((id: string) => {
    setEditingItemId(id)
    setModalOpen(true)
  }, [])

  // 新規登録モーダルを開く
  const handleOpenNew = () => {
    setEditingItemId(null)
    setModalOpen(true)
  }

  // ドラッグ&ドロップセンサー（ロングプレス500msで開始）
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { delay: 500, tolerance: 5 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 500, tolerance: 5 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingItemId(event.active.id as string)
    // ドラッグ開始時に触覚フィードバック
    if (navigator.vibrate) navigator.vibrate(50)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggingItemId(null)

    if (!over) return

    // タブへのドロップ
    const dropId = over.id as string
    if (dropId.startsWith('tab-')) {
      const targetTab = dropId.replace('tab-', '') as TabType
      const itemId = active.id as string
      const item = items.find((i) => i.id === itemId)
      if (!item || item.currentTab === targetTab) return

      const toTab = TABS.find((t) => t.type === targetTab)?.label ?? ''

      moveToTab(itemId, targetTab)
      showSnackbar(`${item.name}を${toTab}に移動しました`)

      // 移動先のタブに切り替え
      setActiveTab(targetTab)

      // 触覚フィードバック
      if (navigator.vibrate) navigator.vibrate(30)
    }
  }

  const draggingItem = draggingItemId ? items.find((i) => i.id === draggingItemId) : null

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <PendingItemsBanner />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* タブコンテンツ（カルーセル） */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {TABS.map((tab) => (
              <div key={tab.type} className="w-full flex-shrink-0 snap-center overflow-y-auto">
                <ItemList tab={tab.type} onCheckItem={handleCheckItem} onEditItem={handleEditItem} />
              </div>
            ))}
          </div>

          <Snackbar />
          <InstallPrompt />
        </div>

        {/* ドラッグ中のオーバーレイ */}
        <DragOverlay>
          {draggingItem ? (
            <div className="shadow-xl rounded-xl opacity-90">
              <ItemCard item={draggingItem} onCheck={() => {}} showCheckbox={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* FAB（新規登録ボタン） */}
      <button
        onClick={handleOpenNew}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full shadow-lg z-40 flex items-center justify-center"
        style={{ touchAction: 'manipulation' }}
      >
        <Icon name="add" size={28} />
      </button>

      {/* 新規登録・編集モーダル */}
      <ItemFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editItemId={editingItemId}
      />
    </>
  )
}
