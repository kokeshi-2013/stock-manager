import { useDroppable } from '@dnd-kit/core'
import type { TabType } from '../../types/item'
import { Icon } from './Icon'

interface DroppableTabProps {
  tab: TabType
  label: string
  icon?: string
  count: number
  isActive: boolean
  isDragging: boolean
  isCompact: boolean
  onClick: () => void
}

export function DroppableTab({
  tab,
  label,
  icon,
  count,
  isActive,
  isDragging,
  isCompact,
  onClick,
}: DroppableTabProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `tab-${tab}`,
    data: { tab },
  })

  const sizeClass = isCompact
    ? 'px-3 min-w-[44px] justify-center'
    : 'px-4 flex-1 justify-center'

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`flex items-center gap-1 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${sizeClass} ${
        isOver && isDragging
          ? 'border-primary bg-primary-light text-primary scale-105'
          : isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon ? <Icon name={icon as 'keep'} size={20} filled={isActive} /> : label}
      {count > 0 && !isCompact && (
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
