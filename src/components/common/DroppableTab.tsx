import { useDroppable } from '@dnd-kit/core'
import type { TabType } from '../../types/item'

interface DroppableTabProps {
  tab: TabType
  label: string
  count: number
  isActive: boolean
  isDragging: boolean
  onClick: () => void
}

export function DroppableTab({
  tab,
  label,
  count,
  isActive,
  isDragging,
  onClick,
}: DroppableTabProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `tab-${tab}`,
    data: { tab },
  })

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        isOver && isDragging
          ? 'border-primary bg-primary-light text-primary scale-105'
          : isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
            isActive || (isOver && isDragging)
              ? 'bg-primary-light text-primary'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}
