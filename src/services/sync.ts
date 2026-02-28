import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDB } from '../lib/firebase'
import { useSyncStore } from '../store/syncStore'
import { useListStore } from '../store/listStore'
import { useItemStore } from '../store/itemStore'
import { usageMonitor } from './usageMonitor'
import type { Item } from '../types/item'

// リストごとのリスナー管理
const listListeners: Map<string, Unsubscribe> = new Map()

/**
 * Item → Firestoreドキュメント変換
 */
function itemToDoc(item: Item): Record<string, unknown> {
  return {
    listId: item.listId,
    addedBy: item.addedBy,
    name: item.name,
    imageUrl: item.imageUrl,
    barcode: item.barcode,
    purchasePlace: item.purchasePlace,
    consumptionRate: item.consumptionRate,
    memo: item.memo,
    isStarred: item.isStarred,
    currentTab: item.currentTab,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    trashedAt: item.trashedAt,
    checkHistory: item.checkHistory,
    nextRemindDate: item.nextRemindDate,
  }
}

/**
 * Firestoreドキュメント → Item変換
 */
function docToItem(id: string, data: Record<string, unknown>, listId: string): Item {
  return {
    id,
    listId: (data.listId as string) ?? listId,
    addedBy: (data.addedBy as string) ?? (data.userId as string) ?? 'unknown',
    name: (data.name as string) ?? '',
    imageUrl: (data.imageUrl as string | null) ?? null,
    barcode: (data.barcode as string | null) ?? null,
    purchasePlace: (data.purchasePlace as string | null) ?? null,
    consumptionRate: (data.consumptionRate as Item['consumptionRate']) ?? 'OCCASIONAL',
    memo: (data.memo as string | null) ?? null,
    isStarred: (data.isStarred as boolean) ?? false,
    currentTab: (data.currentTab as Item['currentTab']) ?? 'SOON',
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
    trashedAt: (data.trashedAt as string | null) ?? null,
    checkHistory: (data.checkHistory as Item['checkHistory']) ?? [],
    nextRemindDate: (data.nextRemindDate as string) ?? new Date().toISOString(),
  }
}

/**
 * Firestoreにアイテムを書き込む（1件）
 * Googleログイン時のみ書き込む
 */
export async function syncItemToFirestore(item: Item): Promise<void> {
  const db = getDB()
  const { savingMode, authProvider } = useSyncStore.getState()

  // Googleログインしていない場合はスキップ
  if (!db || authProvider === 'anonymous') return

  // 節約モード中はスキップ
  if (savingMode) {
    console.log('[Sync] 節約モード中 - Firestore書き込みスキップ')
    return
  }

  // listIdが必要
  if (!item.listId) return

  try {
    const itemRef = doc(db, 'lists', item.listId, 'items', item.id)
    await setDoc(itemRef, itemToDoc(item))
    usageMonitor.countWrite()
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'resource-exhausted') {
      console.error('[Sync] 無料枠超過 - ローカルにのみ保存')
      useSyncStore.getState().setError('同期を一時停止中（使用量上限）')
    } else {
      console.error('[Sync] 書き込みエラー:', error)
      useSyncStore.getState().setError('同期エラーが発生しました')
    }
  }
}

/**
 * Firestoreからアイテムを削除する（完全削除）
 */
export async function deleteItemFromFirestore(itemId: string): Promise<void> {
  const db = getDB()
  const { savingMode, authProvider } = useSyncStore.getState()

  if (!db || authProvider === 'anonymous' || savingMode) return

  // アイテムのlistIdを取得
  const item = useItemStore.getState().items.find((i) => i.id === itemId)
  if (!item?.listId) return

  try {
    await deleteDoc(doc(db, 'lists', item.listId, 'items', itemId))
    usageMonitor.countWrite()
  } catch (error) {
    console.error('[Sync] 削除エラー:', error)
  }
}

/**
 * 特定リストのアイテムをFirestoreにアップロード
 */
export async function uploadItemsForList(listId: string): Promise<void> {
  const db = getDB()
  if (!db) return

  const items = useItemStore.getState().items.filter((item) => item.listId === listId)
  console.log(`[Sync] リスト${listId}の${items.length}件をアップロード中...`)

  for (const item of items) {
    try {
      const itemRef = doc(db, 'lists', listId, 'items', item.id)
      await setDoc(itemRef, itemToDoc(item))
      usageMonitor.countWrite()
    } catch (error) {
      console.error('[Sync] アップロードエラー:', item.name, error)
    }
  }
}

/**
 * 全リストのアイテムをFirestoreにアップロード
 */
export async function uploadAllItems(): Promise<void> {
  const lists = useListStore.getState().lists
  for (const list of lists) {
    await uploadItemsForList(list.id)
  }
  console.log('[Sync] 全アイテムアップロード完了')
}

/**
 * 特定リストのリアルタイム同期を開始する
 */
export function startListSync(listId: string): void {
  const db = getDB()
  if (!db) return

  // 既にリスナーがあれば解除
  const existing = listListeners.get(listId)
  if (existing) {
    existing()
    listListeners.delete(listId)
  }

  const itemsRef = collection(db, 'lists', listId, 'items')
  const q = query(itemsRef)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      useSyncStore.getState().setStatus('connected')
      useSyncStore.getState().setError(null)

      const changedDocs = snapshot.docChanges()
      if (changedDocs.length > 0) {
        usageMonitor.countRead(changedDocs.length)
      }

      // Firestoreのデータ
      const firestoreItems: Item[] = snapshot.docs.map((d) =>
        docToItem(d.id, d.data() as Record<string, unknown>, listId)
      )

      // 現在のアイテムから、このリスト以外のアイテムを保持
      const otherItems = useItemStore.getState().items.filter(
        (item) => item.listId !== listId
      )

      // マージ：他のリストのアイテム + Firestoreのアイテム
      const mergedItems = [...otherItems, ...firestoreItems]
      useItemStore.setState({ items: mergedItems })
    },
    (error) => {
      console.error(`[Sync] リスト${listId}の同期エラー:`, error)
      useSyncStore.getState().setStatus('error')
      useSyncStore.getState().setError('同期接続にエラーが発生しました')
    }
  )

  listListeners.set(listId, unsubscribe)
  console.log(`[Sync] リスト${listId}のリアルタイム同期開始`)
}

/**
 * 全リストのリアルタイム同期を開始する
 */
export function startRealtimeSync(): void {
  const lists = useListStore.getState().lists
  useSyncStore.getState().setStatus('connecting')

  for (const list of lists) {
    startListSync(list.id)
  }

  console.log(`[Sync] ${lists.length}個のリストのリアルタイム同期開始`)
}

/**
 * 特定リストのリアルタイム同期を停止する
 */
export function stopListSync(listId: string): void {
  const unsubscribe = listListeners.get(listId)
  if (unsubscribe) {
    unsubscribe()
    listListeners.delete(listId)
    console.log(`[Sync] リスト${listId}の同期停止`)
  }
}

/**
 * 全リストのリアルタイム同期を停止する
 */
export function stopRealtimeSync(): void {
  for (const [listId, unsubscribe] of listListeners) {
    unsubscribe()
    console.log(`[Sync] リスト${listId}の同期停止`)
  }
  listListeners.clear()
  useSyncStore.getState().setStatus('disconnected')
  console.log('[Sync] 全リアルタイム同期停止')
}
