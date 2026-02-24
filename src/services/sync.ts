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
import { useItemStore } from '../store/itemStore'
import { usageMonitor } from './usageMonitor'
import type { Item } from '../types/item'

let unsubscribeSnapshot: Unsubscribe | null = null

/**
 * Item → Firestoreドキュメント変換
 */
function itemToDoc(item: Item): Record<string, unknown> {
  return {
    userId: item.userId,
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
function docToItem(id: string, data: Record<string, unknown>, familyGroupId: string): Item {
  return {
    id,
    userId: (data.userId as string) ?? 'unknown',
    familyGroupId,
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
 */
export async function syncItemToFirestore(item: Item): Promise<void> {
  const db = getDB()
  const { familyGroupId, mode, savingMode } = useSyncStore.getState()

  if (!db || mode !== 'shared' || !familyGroupId) return

  // 節約モード中はスキップ（ローカルにだけ保存）
  if (savingMode) {
    console.log('[Sync] 節約モード中 - Firestore書き込みスキップ')
    return
  }

  try {
    const itemRef = doc(db, 'familyGroups', familyGroupId, 'items', item.id)
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
  const { familyGroupId, mode, savingMode } = useSyncStore.getState()

  if (!db || mode !== 'shared' || !familyGroupId || savingMode) return

  try {
    await deleteDoc(doc(db, 'familyGroups', familyGroupId, 'items', itemId))
    usageMonitor.countWrite()
  } catch (error) {
    console.error('[Sync] 削除エラー:', error)
  }
}

/**
 * ローカルの全アイテムをFirestoreにアップロード（共有開始時）
 */
export async function uploadAllItems(): Promise<void> {
  const db = getDB()
  const { familyGroupId } = useSyncStore.getState()

  if (!db || !familyGroupId) return

  const items = useItemStore.getState().items
  const userId = useSyncStore.getState().userId

  console.log(`[Sync] ${items.length}件のアイテムをアップロード中...`)

  for (const item of items) {
    try {
      const updatedItem = { ...item, userId, familyGroupId }
      const itemRef = doc(db, 'familyGroups', familyGroupId, 'items', item.id)
      await setDoc(itemRef, itemToDoc(updatedItem))
      usageMonitor.countWrite()
    } catch (error) {
      console.error('[Sync] アップロードエラー:', item.name, error)
    }
  }

  console.log('[Sync] アップロード完了')
}

/**
 * Firestoreのリアルタイム同期を開始する
 * onSnapshotで変更をリアルタイムに受信してZustandに反映
 */
export function startRealtimeSync(): void {
  const db = getDB()
  const { familyGroupId, mode } = useSyncStore.getState()

  if (!db || mode !== 'shared' || !familyGroupId) return

  // 既存のリスナーを解除
  stopRealtimeSync()

  useSyncStore.getState().setStatus('connecting')

  const itemsRef = collection(db, 'familyGroups', familyGroupId, 'items')
  const q = query(itemsRef)

  unsubscribeSnapshot = onSnapshot(
    q,
    (snapshot) => {
      useSyncStore.getState().setStatus('connected')
      useSyncStore.getState().setError(null)

      // ドキュメント数をカウント（初回は全件、以降は変更分のみ）
      const changedDocs = snapshot.docChanges()
      if (changedDocs.length > 0) {
        usageMonitor.countRead(changedDocs.length)
      }

      // Firestoreのデータで itemStore を更新
      const firestoreItems: Item[] = snapshot.docs.map((doc) =>
        docToItem(doc.id, doc.data() as Record<string, unknown>, familyGroupId)
      )

      // ローカルのみのアイテム（familyGroupIdがないもの）は保持
      const localOnlyItems = useItemStore.getState().items.filter(
        (item) => !item.familyGroupId || item.familyGroupId !== familyGroupId
      )

      // マージ：ローカルのみ + Firestoreのアイテム
      const mergedItems = [...localOnlyItems, ...firestoreItems]

      // Zustandを直接更新（コンフリクト解決: 最後に更新した方が勝つ）
      useItemStore.setState({ items: mergedItems })
    },
    (error) => {
      console.error('[Sync] リアルタイム同期エラー:', error)
      useSyncStore.getState().setStatus('error')
      useSyncStore.getState().setError('同期接続にエラーが発生しました')
    }
  )

  console.log('[Sync] リアルタイム同期開始')
}

/**
 * リアルタイム同期を停止する
 */
export function stopRealtimeSync(): void {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot()
    unsubscribeSnapshot = null
    useSyncStore.getState().setStatus('disconnected')
    console.log('[Sync] リアルタイム同期停止')
  }
}
