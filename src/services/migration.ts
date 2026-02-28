import type { StockItem } from '../types'
import type { Item } from '../types/item'
import type { ShoppingList } from '../types/list'
import { DEFAULT_LIST_NAME } from '../types/list'
import { calculateNextRemindDate, calculateTab } from './reminder'

const V1_STORAGE_KEY = 'kaitas-items'
const MIGRATION_V2_DONE_KEY = 'kaitas-v2-migration-done'
const MIGRATION_V3_DONE_KEY = 'kaitas-v3-migration-done'
const V2_ITEMS_KEY = 'kaitas-v2-items'
const V3_LISTS_KEY = 'kaitas-v3-lists'

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
    listId: '', // v3マイグレーションで設定される
    addedBy: 'local-user',
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
  if (localStorage.getItem(MIGRATION_V2_DONE_KEY)) {
    return []
  }

  try {
    const raw = localStorage.getItem(V1_STORAGE_KEY)
    if (!raw) return []

    const oldItems: StockItem[] = JSON.parse(raw)
    if (!Array.isArray(oldItems) || oldItems.length === 0) return []

    const migrated = oldItems.map(migrateStockItem)
    localStorage.setItem(MIGRATION_V2_DONE_KEY, 'true')
    return migrated
  } catch {
    return []
  }
}

/**
 * v2→v3マイグレーション
 * 既存のアイテムにlistIdを付与し、リストストアにデフォルトリストを作成する
 *
 * 処理内容:
 * 1. listIdが未設定のアイテムを検出
 * 2. デフォルトリスト「マイリスト」を作成
 * 3. 全アイテムのlistIdをデフォルトリストIDに設定
 * 4. userIdをaddedByにコピー
 * 5. 旧familyGroupIdがあるアイテムは別リストに分類
 */
export function migrateV2ToV3(): { updatedItems: Item[]; newLists: ShoppingList[] } | null {
  // 既に移行済みならスキップ
  if (localStorage.getItem(MIGRATION_V3_DONE_KEY)) {
    return null
  }

  try {
    // v2のアイテムデータを読み込む
    const rawItems = localStorage.getItem(V2_ITEMS_KEY)
    if (!rawItems) {
      localStorage.setItem(MIGRATION_V3_DONE_KEY, 'true')
      return null
    }

    const parsed = JSON.parse(rawItems)
    const items: Item[] = parsed?.state?.items ?? []

    if (items.length === 0) {
      localStorage.setItem(MIGRATION_V3_DONE_KEY, 'true')
      return null
    }

    // 既にv3対応済み（listIdがある）ならスキップ
    const needsMigration = items.some((item) => !item.listId)
    if (!needsMigration) {
      localStorage.setItem(MIGRATION_V3_DONE_KEY, 'true')
      return null
    }

    // syncStoreからユーザー情報を読み込む
    const rawSync = localStorage.getItem('kaitas-sync')
    const syncData = rawSync ? JSON.parse(rawSync)?.state : null
    const userId: string = syncData?.userId ?? 'local-user'
    const familyGroupId: string | null = syncData?.familyGroupId ?? null
    const familyCode: string | null = syncData?.familyCode ?? null

    const now = new Date().toISOString()
    const newLists: ShoppingList[] = []

    // デフォルトリスト（通常のアイテム用）
    const defaultListId = crypto.randomUUID()
    const defaultList: ShoppingList = {
      id: defaultListId,
      name: DEFAULT_LIST_NAME,
      ownerUid: userId,
      memberUids: [userId],
      shareCode: null,
      createdAt: now,
      updatedAt: now,
    }
    newLists.push(defaultList)

    // 旧家族グループのアイテム用リスト（もしfamilyGroupIdがあれば）
    let familyListId: string | null = null
    if (familyGroupId) {
      familyListId = familyGroupId // 同じIDを使って互換性を保つ
      const familyList: ShoppingList = {
        id: familyListId,
        name: '家族の共有リスト',
        ownerUid: userId,
        memberUids: [userId], // メンバーは後でFirestoreから同期される
        shareCode: familyCode,
        createdAt: now,
        updatedAt: now,
      }
      newLists.push(familyList)
    }

    // アイテムを更新
    const updatedItems = items.map((item) => {
      const updated = { ...item }

      // listIdを設定
      if (!updated.listId) {
        if (item.familyGroupId && familyListId) {
          updated.listId = familyListId
        } else {
          updated.listId = defaultListId
        }
      }

      // addedByを設定
      if (!updated.addedBy) {
        updated.addedBy = item.userId ?? userId
      }

      return updated
    })

    // 移行完了フラグ
    localStorage.setItem(MIGRATION_V3_DONE_KEY, 'true')

    // 旧データのバックアップ（30日間保持）
    try {
      localStorage.setItem('kaitas-v2-backup', JSON.stringify({
        items: parsed,
        backedUpAt: now,
      }))
    } catch {
      // バックアップ失敗は無視（容量不足の可能性）
    }

    console.log(`[Migration] v2→v3完了: ${updatedItems.length}件のアイテム, ${newLists.length}個のリスト`)
    return { updatedItems, newLists }
  } catch (error) {
    console.error('[Migration] v2→v3マイグレーションエラー:', error)
    // エラーでも移行フラグは立てない（次回リトライ可能に）
    return null
  }
}

/**
 * v2バックアップを掃除する（30日経過後に呼ぶ）
 */
export function cleanupV2Backup(): void {
  try {
    const raw = localStorage.getItem('kaitas-v2-backup')
    if (!raw) return

    const backup = JSON.parse(raw)
    const backedUpAt = new Date(backup.backedUpAt)
    const daysSinceBackup = (Date.now() - backedUpAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceBackup >= 30) {
      localStorage.removeItem('kaitas-v2-backup')
      console.log('[Migration] v2バックアップを削除しました（30日経過）')
    }
  } catch {
    // 無視
  }
}
