import { useState, useEffect, useCallback } from 'react'
import { Icon } from './Icon'
import { useItemStore } from '../../store/itemStore'
import { useUIStore } from '../../store/uiStore'

const STORAGE_KEY = 'kaitas-pending-items'

interface PendingItem {
  name: string
  addedAt: string
}

export function PendingItemsBanner() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const addItem = useItemStore((s) => s.addItem)
  const showSnackbar = useUIStore((s) => s.showSnackbar)

  // localStorageから待ちリストを読み込み
  const loadPendingItems = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const items: PendingItem[] = JSON.parse(raw)
        setPendingItems(items)
      } else {
        setPendingItems([])
      }
    } catch {
      setPendingItems([])
    }
  }, [])

  useEffect(() => {
    loadPendingItems()

    // storageイベントで他タブからの変更も検知
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadPendingItems()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [loadPendingItems])

  // まとめて登録
  const handleRegisterAll = useCallback(async () => {
    if (pendingItems.length === 0) return
    setIsRegistering(true)

    const count = pendingItems.length
    for (const item of pendingItems) {
      addItem({
        name: item.name,
        consumptionRate: 'OCCASIONAL', // デフォルト: たまに使う
      })
    }

    // 待ちリストをクリア
    localStorage.removeItem(STORAGE_KEY)
    setPendingItems([])
    setIsExpanded(false)
    setIsRegistering(false)

    showSnackbar(`${count}件を登録しました`)
  }, [pendingItems, addItem, showSnackbar])

  // 個別削除
  const handleRemoveItem = useCallback((index: number) => {
    const updated = pendingItems.filter((_, i) => i !== index)
    if (updated.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
    setPendingItems(updated)
  }, [pendingItems])

  // 全クリア
  const handleClearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPendingItems([])
    setIsExpanded(false)
  }, [])

  if (pendingItems.length === 0) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      {/* メインバナー行 */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon name="playlist_add" size={20} />
        <span className="flex-1 text-sm font-medium text-amber-900">
          {pendingItems.length}件の追加リクエスト
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleRegisterAll()
          }}
          disabled={isRegistering}
          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-medium rounded-full disabled:opacity-50"
        >
          {isRegistering ? '登録中…' : 'まとめて登録'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClearAll()
          }}
          className="p-1 text-amber-600 hover:bg-amber-100 rounded"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* 展開: 商品名リスト */}
      {isExpanded && (
        <div className="px-4 pb-2.5 space-y-1">
          {pendingItems.map((item, index) => (
            <div
              key={`${item.name}-${item.addedAt}`}
              className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5"
            >
              <span className="flex-1 text-sm text-gray-700">{item.name}</span>
              <button
                onClick={() => handleRemoveItem(index)}
                className="p-0.5 text-gray-400 hover:text-red-500"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
