import type { TabType } from '../../types/item'
import { TABS } from '../../constants/tabs'
import { useItemStore } from '../../store/itemStore'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const items = useItemStore((s) => s.items)

  const getCount = (tab: TabType) => items.filter((i) => i.currentTab === tab).length

  return (
    <div className="flex border-b border-gray-200 bg-white px-2 overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => {
        const count = getCount(tab.type)
        const isActive = activeTab === tab.type
        return (
          <button
            key={tab.type}
            onClick={() => onTabChange(tab.type)}
            className={`flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                  isActive ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
