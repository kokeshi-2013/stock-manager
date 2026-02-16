import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useItemStore } from '../store/itemStore'
import { useUIStore } from '../store/uiStore'
import { TABS } from '../constants/tabs'
import { Header } from '../components/common/Header'
import { TabBar } from '../components/common/TabBar'
import { SearchBar } from '../components/common/SearchBar'
import { Snackbar } from '../components/common/Snackbar'
import { ItemList } from '../components/item/ItemList'
import { InstallPrompt } from '../components/pwa/InstallPrompt'

export default function TopPage() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkMigration = useItemStore((s) => s.checkMigration)
  const recalculateAllTabs = useItemStore((s) => s.recalculateAllTabs)
  const runTrashCleanup = useItemStore((s) => s.runTrashCleanup)
  const markAsBought = useItemStore((s) => s.markAsBought)
  const items = useItemStore((s) => s.items)

  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const showSnackbar = useUIStore((s) => s.showSnackbar)

  // 初回：データ移行 + タブ再計算 + ゴミ箱掃除
  useEffect(() => {
    checkMigration()
    recalculateAllTabs()
    runTrashCleanup()
  }, [])

  // タブ切り替え時にスクロール
  const tabIndex = TABS.findIndex((t) => t.type === activeTab)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: tabIndex * scrollRef.current.clientWidth,
        behavior: 'smooth',
      })
    }
  }, [tabIndex])

  // スワイプでタブ切り替え
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const newIndex = Math.round(scrollLeft / clientWidth)
    if (newIndex >= 0 && newIndex < TABS.length && TABS[newIndex].type !== activeTab) {
      setActiveTab(TABS[newIndex].type)
    }
  }

  // 「買った！」処理
  const handleCheckItem = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    const prevHistory = [...item.checkHistory]
    const prevTab = item.currentTab

    markAsBought(id)
    showSnackbar(`${item.name}を買った！に記録しました`, () => {
      useItemStore.getState().undoBought(id, prevHistory, prevTab)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
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
            <ItemList tab={tab.type} onCheckItem={handleCheckItem} />
          </div>
        ))}
      </div>

      {/* FAB（新規登録ボタン） */}
      <button
        onClick={() => navigate('/app/new')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full shadow-lg z-30 flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      <Snackbar />
      <InstallPrompt />
    </div>
  )
}
