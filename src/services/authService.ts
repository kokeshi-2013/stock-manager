import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseAuth } from '../lib/firebase'

/**
 * 匿名認証でログインする
 * すでにログイン済みの場合は何もしない
 * Firebase Auth の準備完了を待ち、失敗時は1回リトライする
 */
export async function signInAnonymouslyIfNeeded(): Promise<User | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null

  // Firebase Auth の内部状態が準備完了するまで待つ
  await auth.authStateReady()

  // すでにログイン中ならそのユーザーを返す
  if (auth.currentUser) {
    return auth.currentUser
  }

  // リトライ付き匿名認証（1回リトライ）
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const credential = await signInAnonymously(auth)
      console.log('[Auth] 匿名ログイン成功:', credential.user.uid)
      return credential.user
    } catch (error) {
      console.error(`[Auth] 匿名ログイン失敗 (${attempt + 1}回目):`, error)
      if (attempt === 0) {
        // 1秒待ってリトライ
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      return null
    }
  }
  return null
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
