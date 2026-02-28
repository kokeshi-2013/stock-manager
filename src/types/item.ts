export type ConsumptionRate = 'FREQUENT' | 'OCCASIONAL' | 'STOCKPILE'

export type TabType = 'STAR' | 'SOON' | 'FUTURE' | 'STORAGE' | 'TRASH'

export interface CheckEntry {
  checkedAt: string // ISO 8601
}

export interface Item {
  id: string
  /** どのリストに属するか（v3で追加） */
  listId: string
  /** 誰が追加したか（v3で追加、旧userIdの代替） */
  addedBy: string
  /**
   * @deprecated v3でlistIdに移行。互換性のために残す。
   * マイグレーション完了後にPhase Gで削除。
   */
  userId?: string
  /**
   * @deprecated v3でlistIdに移行。互換性のために残す。
   * マイグレーション完了後にPhase Gで削除。
   */
  familyGroupId?: string | null
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
