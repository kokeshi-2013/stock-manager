import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, GripVertical } from 'lucide-react'
import type { Item } from '../../types/item'
import { getSmartIcon } from '../../utils/smartIcon'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface ItemCardProps {
  item: Item
  onCheck: (id: string) => void
  showCheckbox?: boolean
  isDragging?: boolean
  dragHandleListeners?: SyntheticListenerMap
}

export function ItemCard({
  item,
  onCheck,
  showCheckbox = true,
  isDragging = false,
  dragHandleListeners,
}: ItemCardProps) {
  const navigate = useNavigate()
  const [animState, setAnimState] = useState<'idle' | 'checked' | 'sliding'>('idle')

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (animState !== 'idle') return

    // 触覚フィードバック（Android）
    if (navigator.vibrate) navigator.vibrate(30)

    setAnimState('checked')
    // 1.5秒後にスライドアウト
    setTimeout(() => {
      setAnimState('sliding')
      // スライドアウト完了後に実際の処理
      setTimeout(() => {
        onCheck(item.id)
      }, 400)
    }, 1500)
  }

  const cardClass = [
    'bg-white px-4 py-3 flex items-center gap-3 cursor-pointer rounded-xl shadow-sm overflow-hidden transition-all',
    animState === 'checked' && 'animate-bought-check',
    animState === 'sliding' && 'animate-slide-out',
    animState === 'idle' && 'active:bg-gray-50',
    isDragging && 'shadow-lg scale-[1.02]',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      onClick={animState === 'idle' ? () => navigate(`/app/edit/${item.id}`) : undefined}
      className={cardClass}
    >
      {/* ドラッグハンドル */}
      {dragHandleListeners && (
        <div
          {...dragHandleListeners}
          className="flex items-center justify-center w-6 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing text-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} />
        </div>
      )}

      {/* チェックボックス */}
      {showCheckbox && (
        <button
          onClick={handleCheck}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            animState !== 'idle'
              ? 'border-primary bg-primary'
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          <Check
            size={14}
            className={animState !== 'idle' ? 'text-white' : 'text-transparent'}
          />
        </button>
      )}

      {/* 商品画像/アイコン */}
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span>{getSmartIcon(item.name, item.purchasePlace ?? undefined)}</span>
        )}
      </div>

      {/* テキスト情報 */}
      <div className="flex-1 min-w-0">
        {animState !== 'idle' ? (
          <p className="font-medium text-sm text-primary">買った！ ✅</p>
        ) : (
          <>
            <p className="font-medium text-sm line-clamp-1">{item.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.currentTab === 'TRASH' && item.trashedAt ? (
                <span className="text-xs text-error">
                  {(() => {
                    const remaining = 30 - Math.floor((Date.now() - new Date(item.trashedAt).getTime()) / (1000 * 60 * 60 * 24))
                    return remaining > 0 ? `あと${remaining}日で完全削除` : 'まもなく完全削除'
                  })()}
                </span>
              ) : (
                <>
                  {item.purchasePlace && (
                    <span className="text-xs text-gray-400">{item.purchasePlace}</span>
                  )}
                  {item.memo && <span className="text-xs text-gray-300">|</span>}
                  {item.memo && (
                    <span className="text-xs text-gray-400 line-clamp-1">{item.memo}</span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
