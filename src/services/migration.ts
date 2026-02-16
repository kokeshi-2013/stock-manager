import type { StockItem } from '../types'
import type { Item } from '../types/item'
import { calculateNextRemindDate, calculateTab } from './reminder'

const V1_STORAGE_KEY = 'kaitas-items'
const MIGRATION_DONE_KEY = 'kaitas-v2-migration-done'

/**
 * 旧StockItemを新Item形式に変換する
 */
export function migrateStockItem(old: StockItem): Item {
  // buyUrlsをメモに退避
  const urlParts: string[] = []
  if (old.buyUrls?.amazon) urlParts.push(`Amazon: ${old.buyUrls.amazon}`)
  if (old.buyUrls?.rakuten) urlParts.push(`楽天: ${old.buyUrls.rakuten}`)
  if (old.buyUrls?.yahoo) urlParts.push(`Yahoo: ${old.buyUrls.yahoo}`)
  const memo = urlParts.length > 0 ? urlParts.join('\n') : null

  const now = new Date().toISOString()

  const partial = {
    consumptionRate: 'OCCASIONAL' as const,
    checkHistory: [] as Item['checkHistory'],
    createdAt: old.createdAt || now,
  }

  const nextRemindDate = calculateNextRemindDate(partial)

  const item: Item = {
    id: old.id || crypto.randomUUID(),
    userId: 'local-user',
    familyGroupId: null,
    name: old.name,
    imageUrl: old.imageUrl || null,
    barcode: null,
    purchasePlace: old.category || null,
    consumptionRate: 'OCCASIONAL',
    memo,
    isStarred: false,
    currentTab: 'STORAGE', // 仮の値、下で再計算
    createdAt: old.createdAt || now,
    updatedAt: now,
    trashedAt: null,
    checkHistory: [],
    nextRemindDate,
  }

  // countに基づく初期タブ振り分け（移行時の特別ロジック）
  if (old.count <= 1) {
    item.currentTab = 'SOON'
  } else if (old.count <= 3) {
    item.currentTab = 'FUTURE'
  } else {
    item.currentTab = calculateTab(item)
  }

  return item
}

/**
 * v1のlocalStorageデータを読み込んで移行する
 * 既に移行済みなら空配列を返す
 */
export function loadAndMigrateV1Data(): Item[] {
  if (localStorage.getItem(MIGRATION_DONE_KEY)) {
    return []
  }

  try {
    const raw = localStorage.getItem(V1_STORAGE_KEY)
    if (!raw) return []

    const oldItems: StockItem[] = JSON.parse(raw)
    if (!Array.isArray(oldItems) || oldItems.length === 0) return []

    const migrated = oldItems.map(migrateStockItem)
    localStorage.setItem(MIGRATION_DONE_KEY, 'true')
    return migrated
  } catch {
    return []
  }
}
