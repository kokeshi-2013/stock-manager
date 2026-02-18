import type { TabType } from '../../types/item'
import { TABS } from '../../constants/tabs'
import { useItemStore } from '../../store/itemStore'
import { useUIStore } from '../../store/uiStore'
import { DroppableTab } from './DroppableTab'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const items = useItemStore((s) => s.items)
  const draggingItemId = useUIStore((s) => s.draggingItemId)

  const getCount = (tab: TabType) => items.filter((i) => i.currentTab === tab).length

  return (
    <div className="flex border-b border-gray-200 bg-white px-2 overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => (
        <DroppableTab
          key={tab.type}
          tab={tab.type}
          label={tab.label}
          count={getCount(tab.type)}
          isActive={activeTab === tab.type}
          isDragging={!!draggingItemId}
          isCompact={!!tab.isCompact}
          onClick={() => onTabChange(tab.type)}
        />
      ))}
    </div>
  )
}
