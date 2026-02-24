import type { TabType } from '../types'

export interface TabConfig {
  type: TabType
  label: string
  icon?: string
  emptyMessage: string
  emptySubMessage?: string
  isCompact?: boolean
}

export const TABS: TabConfig[] = [
  {
    type: 'STAR',
    label: '',
    icon: 'keep',
    emptyMessage: 'ピン留めしたものはありません',
    emptySubMessage: 'アイテムを長押しして📌にドラッグするとピン留めできます',
    isCompact: true,
  },
  {
    type: 'SOON',
    label: 'そろそろ',
    emptyMessage: 'そろそろ買わないと！なものはありません',
    emptySubMessage: 'はやめに買い足したほうがいいものがここに表示されます。買い足すものがあれば＋から登録してください',
  },
  {
    type: 'FUTURE',
    label: 'そのうち',
    emptyMessage: 'そのうち買わないと…なものはありません',
    emptySubMessage: '1〜3ヶ月以内に必要になるものがここに表示されます。買い足すものがあれば＋から登録してください',
  },
  {
    type: 'STORAGE',
    label: 'いちおう',
    emptyMessage: 'いちおう買っておくか…なものはありません',
    emptySubMessage: '4ヶ月以上先に必要になるものがここに表示されます。買い足すものがあれば＋から登録してください',
  },
  {
    type: 'TRASH',
    label: '',
    icon: 'delete',
    emptyMessage: 'ゴミ箱は空です',
    emptySubMessage: '削除したアイテムは30日後に自動で完全削除されます',
    isCompact: true,
  },
]

export const DEFAULT_TAB: TabType = 'STAR'
