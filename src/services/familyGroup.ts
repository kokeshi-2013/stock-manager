import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { getDB } from '../lib/firebase'
import { usageMonitor } from './usageMonitor'

/**
 * 6桁のランダムな招待コードを生成
 */
function generateFamilyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 紛らわしい文字(0,O,1,I)を除外
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 新しい家族グループを作成する
 */
export async function createFamilyGroup(userId: string): Promise<{ groupId: string; code: string } | null> {
  const db = getDB()
  if (!db) return null

  try {
    const groupId = crypto.randomUUID()
    const code = generateFamilyCode()

    await setDoc(doc(db, 'familyGroups', groupId), {
      code,
      createdAt: serverTimestamp(),
      createdBy: userId,
      memberUids: [userId],
    })

    usageMonitor.countWrite()
    console.log('[FamilyGroup] グループ作成:', groupId, 'コード:', code)
    return { groupId, code }
  } catch (error) {
    console.error('[FamilyGroup] グループ作成エラー:', error)
    return null
  }
}

/**
 * 招待コードでグループを検索する
 */
export async function findGroupByCode(code: string): Promise<{ groupId: string; code: string } | null> {
  const db = getDB()
  if (!db) return null

  try {
    const q = query(
      collection(db, 'familyGroups'),
      where('code', '==', code.toUpperCase())
    )
    const snapshot = await getDocs(q)

    usageMonitor.countRead(snapshot.size || 1)

    if (snapshot.empty) {
      return null
    }

    const groupDoc = snapshot.docs[0]
    return {
      groupId: groupDoc.id,
      code: groupDoc.data().code,
    }
  } catch (error) {
    console.error('[FamilyGroup] コード検索エラー:', error)
    return null
  }
}

/**
 * グループにメンバーを追加する
 */
export async function joinFamilyGroup(groupId: string, userId: string): Promise<boolean> {
  const db = getDB()
  if (!db) return false

  try {
    const groupRef = doc(db, 'familyGroups', groupId)
    const groupSnap = await getDoc(groupRef)

    usageMonitor.countRead()

    if (!groupSnap.exists()) {
      console.error('[FamilyGroup] グループが見つかりません:', groupId)
      return false
    }

    await updateDoc(groupRef, {
      memberUids: arrayUnion(userId),
    })

    usageMonitor.countWrite()
    console.log('[FamilyGroup] グループ参加完了:', groupId)
    return true
  } catch (error) {
    console.error('[FamilyGroup] グループ参加エラー:', error)
    return false
  }
}

/**
 * グループ情報を取得する
 */
export async function getFamilyGroup(groupId: string): Promise<{
  code: string
  memberCount: number
  createdBy: string
} | null> {
  const db = getDB()
  if (!db) return null

  try {
    const groupSnap = await getDoc(doc(db, 'familyGroups', groupId))

    usageMonitor.countRead()

    if (!groupSnap.exists()) return null

    const data = groupSnap.data()
    return {
      code: data.code,
      memberCount: data.memberUids?.length ?? 0,
      createdBy: data.createdBy,
    }
  } catch (error) {
    console.error('[FamilyGroup] グループ情報取得エラー:', error)
    return null
  }
}
