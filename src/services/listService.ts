import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { getDB, getFirebaseAuth } from '../lib/firebase'
import { usageMonitor } from './usageMonitor'
import type { ShoppingList } from '../types/list'

/**
 * 6桁のランダムな共有コードを生成
 */
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 紛らわしい文字(0,O,1,I)を除外
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * ShoppingList → Firestoreドキュメント変換
 */
function listToDoc(list: ShoppingList): Record<string, unknown> {
  return {
    name: list.name,
    ownerUid: list.ownerUid,
    memberUids: list.memberUids,
    shareCode: list.shareCode,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }
}

/**
 * Firestoreドキュメント → ShoppingList変換
 */
function docToList(id: string, data: Record<string, unknown>): ShoppingList {
  return {
    id,
    name: (data.name as string) ?? 'リスト',
    ownerUid: (data.ownerUid as string) ?? '',
    memberUids: (data.memberUids as string[]) ?? [],
    shareCode: (data.shareCode as string | null) ?? null,
    createdAt: (data.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (data.updatedAt as string) ?? new Date().toISOString(),
  }
}

/**
 * リストをFirestoreに保存する
 */
export async function saveListToFirestore(list: ShoppingList): Promise<boolean> {
  const db = getDB()
  if (!db) return false

  try {
    await setDoc(doc(db, 'lists', list.id), listToDoc(list))
    usageMonitor.countWrite()
    console.log('[ListService] リスト保存:', list.id, list.name)
    return true
  } catch (error) {
    console.error('[ListService] リスト保存エラー:', error)
    return false
  }
}

/**
 * リストをFirestoreから削除する
 */
export async function deleteListFromFirestore(listId: string): Promise<boolean> {
  const db = getDB()
  if (!db) return false

  try {
    await deleteDoc(doc(db, 'lists', listId))
    usageMonitor.countWrite()
    console.log('[ListService] リスト削除:', listId)
    return true
  } catch (error) {
    console.error('[ListService] リスト削除エラー:', error)
    return false
  }
}

/**
 * ユーザーのリスト一覧をFirestoreから取得する
 * memberUidsに自分のUIDが含まれるリストを検索
 */
export async function fetchListsForUser(uid: string): Promise<ShoppingList[]> {
  const db = getDB()
  if (!db) return []

  try {
    const q = query(
      collection(db, 'lists'),
      where('memberUids', 'array-contains', uid)
    )
    const snapshot = await getDocs(q)
    usageMonitor.countRead(snapshot.size || 1)

    return snapshot.docs.map((d) =>
      docToList(d.id, d.data() as Record<string, unknown>)
    )
  } catch (error) {
    console.error('[ListService] リスト取得エラー:', error)
    return []
  }
}

/**
 * 共有コードでリストを検索する
 */
export async function findListByShareCode(code: string): Promise<ShoppingList | null> {
  const db = getDB()
  if (!db) return null

  try {
    const q = query(
      collection(db, 'lists'),
      where('shareCode', '==', code.toUpperCase())
    )
    const snapshot = await getDocs(q)
    usageMonitor.countRead(snapshot.size || 1)

    if (snapshot.empty) return null

    const d = snapshot.docs[0]
    return docToList(d.id, d.data() as Record<string, unknown>)
  } catch (error) {
    console.error('[ListService] 共有コード検索エラー:', error)
    return null
  }
}

/**
 * リストの共有コードを生成する
 * 現在のFirebase認証UIDを使い、全フィールドを書き込む
 */
export async function generateAndSetShareCode(list: ShoppingList): Promise<string | null> {
  const db = getDB()
  if (!db) {
    console.error('[ListService] 共有コード生成: Firestoreが未初期化')
    return null
  }

  // 現在のFirebase認証ユーザーを確認
  const auth = getFirebaseAuth()
  const currentUid = auth?.currentUser?.uid
  if (!currentUid) {
    console.error('[ListService] 共有コード生成: Firebase未認証（currentUser が null）')
    return null
  }

  try {
    const code = generateShareCode()
    const listRef = doc(db, 'lists', list.id)
    const now = new Date().toISOString()

    // memberUidsに現在のUIDが含まれていなければ追加
    // （ローカルストアのUIDとFirebase AuthのUIDがずれている場合の対策）
    const memberUids = list.memberUids.includes(currentUid)
      ? list.memberUids
      : [...list.memberUids, currentUid]

    await setDoc(listRef, {
      name: list.name,
      ownerUid: list.ownerUid === '' || !list.memberUids.includes(list.ownerUid)
        ? currentUid
        : list.ownerUid,
      memberUids,
      shareCode: code,
      createdAt: list.createdAt,
      updatedAt: now,
    })
    usageMonitor.countWrite()
    console.log('[ListService] 共有コード生成:', list.id, code, 'uid:', currentUid)
    return code
  } catch (error) {
    console.error('[ListService] 共有コード生成エラー:', error)
    return null
  }
}

/**
 * リストに参加する（メンバーに自分を追加）
 */
export async function joinList(listId: string, uid: string): Promise<{ success: boolean; error?: string }> {
  const db = getDB()
  if (!db) return { success: false, error: 'データベースに接続できません' }

  try {
    const listRef = doc(db, 'lists', listId)
    const listSnap = await getDoc(listRef)
    usageMonitor.countRead()

    if (!listSnap.exists()) {
      return { success: false, error: 'リストが見つかりません' }
    }

    const data = listSnap.data()
    const memberUids: string[] = data.memberUids ?? []

    if (memberUids.includes(uid)) {
      // 既にメンバー
      return { success: true }
    }

    // メンバーに追加
    await setDoc(listRef, {
      memberUids: [...memberUids, uid],
      updatedAt: new Date().toISOString(),
    }, { merge: true })
    usageMonitor.countWrite()

    console.log('[ListService] リスト参加:', listId, uid)
    return { success: true }
  } catch (error: unknown) {
    console.error('[ListService] リスト参加エラー:', error)
    const err = error as { code?: string; message?: string }
    if (err.code === 'permission-denied') {
      return { success: false, error: 'アクセス権限がありません' }
    }
    return { success: false, error: err.message ?? 'リストへの参加に失敗しました' }
  }
}

/**
 * 全リストをFirestoreにアップロード（Googleログイン後の初回同期）
 */
export async function uploadAllLists(lists: ShoppingList[]): Promise<void> {
  const db = getDB()
  if (!db) return

  console.log(`[ListService] ${lists.length}個のリストをアップロード中...`)

  for (const list of lists) {
    try {
      await setDoc(doc(db, 'lists', list.id), {
        ...listToDoc(list),
        _serverTimestamp: serverTimestamp(),
      })
      usageMonitor.countWrite()
    } catch (error) {
      console.error('[ListService] リストアップロードエラー:', list.name, error)
    }
  }

  console.log('[ListService] リストアップロード完了')
}
