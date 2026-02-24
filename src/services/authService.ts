import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseAuth } from '../lib/firebase'

/**
 * 匿名認証でログインする
 * すでにログイン済みの場合は何もしない
 */
export async function signInAnonymouslyIfNeeded(): Promise<User | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null

  // すでにログイン中ならそのユーザーを返す
  if (auth.currentUser) {
    return auth.currentUser
  }

  try {
    const credential = await signInAnonymously(auth)
    console.log('[Auth] 匿名ログイン成功:', credential.user.uid)
    return credential.user
  } catch (error) {
    console.error('[Auth] 匿名ログイン失敗:', error)
    return null
  }
}

/**
 * 認証状態の変化を監視する
 */
export function observeAuthState(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth()
  if (!auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

/**
 * 現在のユーザーIDを取得
 * ログインしていない場合は 'local-user' を返す
 */
export function getCurrentUserId(): string {
  const auth = getFirebaseAuth()
  return auth?.currentUser?.uid ?? 'local-user'
}
