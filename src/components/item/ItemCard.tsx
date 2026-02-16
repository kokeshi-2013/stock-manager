import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { Item } from '../../types/item'
import { getSmartIcon } from '../../utils/smartIcon'

interface ItemCardProps {
  item: Item
  onCheck: (id: string) => void
  showCheckbox?: boolean
}

export function ItemCard({ item, onCheck, showCheckbox = true }: ItemCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/app/edit/${item.id}`)}
      className="bg-white px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50 border-b border-gray-100"
    >
      {/* チェックボックス */}
      {showCheckbox && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCheck(item.id)
          }}
          className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-primary transition-colors"
        >
          <Check size={14} className="text-transparent" />
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
        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.purchasePlace && (
            <span className="text-xs text-gray-400">{item.purchasePlace}</span>
          )}
          {item.memo && (
            <span className="text-xs text-gray-300">|</span>
          )}
          {item.memo && (
            <span className="text-xs text-gray-400 line-clamp-1">{item.memo}</span>
          )}
        </div>
      </div>
    </div>
  )
}
