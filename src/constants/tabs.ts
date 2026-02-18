import type { TabType } from '../types'

export interface TabConfig {
  type: TabType
  label: string
  emptyMessage: string
  emptySubMessage?: string
  isCompact?: boolean
}

export const TABS: TabConfig[] = [
  {
    type: 'STAR',
    label: '★',
    emptyMessage: 'ピン留めしたものはありません',
    emptySubMessage: 'アイテムを長押しして★にドラッグするとピン留めできます',
    isCompact: true,
  },
  {
    type: 'SOON',
    label: 'そろそろ',
    emptyMessage: '今すぐ買い足すものはありません 🎉',
    emptySubMessage: 'そろそろ買い足すものがあれば、ここに表示されます',
  },
  {
    type: 'FUTURE',
    label: 'そのうち',
    emptyMessage: '近いうちに買い足すものはありません',
    emptySubMessage: '1〜3ヶ月以内に必要になるものがここに表示されます',
  },
  {
    type: 'STORAGE',
    label: 'いちおう',
    emptyMessage: 'ストックに余裕のあるものはありません',
    emptySubMessage: '4ヶ月以上先に必要になるものがここに表示されます',
  },
  {
    type: 'TRASH',
    label: '🗑️',
    emptyMessage: 'ゴミ箱は空です',
    emptySubMessage: '削除したアイテムは30日後に自動で完全削除されます',
    isCompact: true,
  },
]

export const DEFAULT_TAB: TabType = 'SOON'
