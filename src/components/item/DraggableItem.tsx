import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Item } from '../../types/item'
import { ItemCard } from './ItemCard'

interface DraggableItemProps {
  item: Item
  onCheck: (id: string) => void
  onEdit?: (id: string) => void
  showCheckbox?: boolean
}

export function DraggableItem({ item, onCheck, onEdit, showCheckbox }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { item },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ItemCard
        item={item}
        onCheck={onCheck}
        onEdit={onEdit}
        showCheckbox={showCheckbox}
        isDragging={isDragging}
        dragHandleListeners={listeners}
      />
    </div>
  )
}
