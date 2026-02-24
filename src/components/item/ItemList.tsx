import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { TabType } from '../../types/item'
import { useItemStore } from '../../store/itemStore'
import { useUIStore } from '../../store/uiStore'
import { TABS } from '../../constants/tabs'
import { DraggableItem } from './DraggableItem'
import { EmptyState } from '../common/EmptyState'

interface ItemListProps {
  tab: TabType
  onCheckItem: (id: string) => void
  onEditItem?: (id: string) => void
}

export function ItemList({ tab, onCheckItem, onEditItem }: ItemListProps) {
  const items = useItemStore((s) => s.items)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const filterPlace = useUIStore((s) => s.filterPurchasePlace)

  const tabConfig = TABS.find((t) => t.type === tab)

  // フィルタリング
  let filtered = items.filter((item) => item.currentTab === tab)

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.purchasePlace?.toLowerCase().includes(q) ||
        item.memo?.toLowerCase().includes(q)
    )
  }

  if (filterPlace) {
    filtered = filtered.filter((item) => item.purchasePlace === filterPlace)
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        message={tabConfig?.emptyMessage ?? 'アイテムがありません'}
        subMessage={tabConfig?.emptySubMessage}
      />
    )
  }

  const showCheckbox = tab !== 'TRASH'

  return (
    <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3 px-4 py-4">
        {filtered.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onCheck={onCheckItem}
            onEdit={onEditItem}
            showCheckbox={showCheckbox}
          />
        ))}
      </div>
    </SortableContext>
  )
}
