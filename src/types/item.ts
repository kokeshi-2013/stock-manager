export type ConsumptionRate = 'FREQUENT' | 'OCCASIONAL' | 'STOCKPILE'

export type TabType = 'STAR' | 'SOON' | 'FUTURE' | 'STORAGE' | 'TRASH'

export interface CheckEntry {
  checkedAt: string // ISO 8601
}

export interface Item {
  id: string
  userId: string
  familyGroupId: string | null
  name: string
  imageUrl: string | null
  barcode: string | null
  purchasePlace: string | null
  consumptionRate: ConsumptionRate
  memo: string | null
  isStarred: boolean
  currentTab: TabType
  createdAt: string
  updatedAt: string
  trashedAt: string | null
  checkHistory: CheckEntry[]
  nextRemindDate: string
}
