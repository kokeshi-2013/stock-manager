import {
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from '../lib/firebase'
import type { AuthProvider } from '../store/syncStore'

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

/**
 * Userオブジェクトから認証プロバイダー情報を取得
 */
export function getAuthProviderInfo(user: User): {
  authProvider: AuthProvider
  displayName: string | null
  email: string | null
  photoURL: string | null
} {
  // providerData からGoogleプロバイダーを探す
  const googleProvider = user.providerData.find(p => p.providerId === 'google.com')
  const appleProvider = user.providerData.find(p => p.providerId === 'apple.com')

  if (googleProvider) {
    return {
      authProvider: 'google',
      displayName: googleProvider.displayName,
      email: googleProvider.email,
      photoURL: googleProvider.photoURL,
    }
  }
  if (appleProvider) {
    return {
      authProvider: 'apple',
      displayName: appleProvider.displayName,
      email: appleProvider.email,
      photoURL: appleProvider.photoURL,
    }
  }
  return {
    authProvider: 'anonymous',
    displayName: null,
    email: null,
    photoURL: null,
  }
}

/**
 * 匿名アカウントをGoogleアカウントに連携（昇格）する
 * 成功するとUIDはそのまま、Googleアカウントが紐づく → データがそのまま残る
 *
 * まず linkWithPopup（小窓方式）を試す（PC・モバイル共通）
 * ポップアップがブロックされた場合のみ linkWithRedirect（ページ遷移方式）にフォールバック
 */
export async function linkWithGoogle(): Promise<{
  success: boolean
  user?: User
  error?: string
  errorCode?: string
  existingCredential?: ReturnType<typeof GoogleAuthProvider.credentialFromError>
}> {
  const auth = getFirebaseAuth()
  if (!auth || !auth.currentUser) {
    return { success: false, error: 'ログインしていません' }
  }

  const provider = new GoogleAuthProvider()
  const user = auth.currentUser

  try {
    // まずポップアップ方式を試す（PC・モバイル共通で最も確実）
    const result = await linkWithPopup(user, provider)
    return { success: true, user: result.user }
  } catch (error: unknown) {
    const authError = error as { code?: string; message?: string }

    // ポップアップがブロックされた → リダイレクト方式にフォールバック
    if (authError.code === 'auth/popup-blocked') {
      console.log('[Auth] ポップアップブロック → リダイレクト方式にフォールバック')
      try {
        await linkWithRedirect(user, provider)
        // この行は到達しない（ページが遷移するため）
        return { success: true }
      } catch (redirectError) {
        console.error('[Auth] リダイレクト方式も失敗:', redirectError)
        return { success: false, error: 'Googleログインに失敗しました。ブラウザのポップアップを許可してもう一度お試しください。' }
      }
    }

    if (authError.code === 'auth/credential-already-in-use') {
      // このGoogleアカウントは別のFirebaseユーザーに紐づいている
      const credential = GoogleAuthProvider.credentialFromError(error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0])
      return {
        success: false,
        error: 'このGoogleアカウントは別のアカウントに紐づいています',
        errorCode: authError.code,
        existingCredential: credential,
      }
    }
    if (authError.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'ログインがキャンセルされました' }
    }
    if (authError.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'ログインがキャンセルされました' }
    }

    console.error('[Auth] Googleアカウント連携失敗:', error)
    return { success: false, error: 'Googleログインに失敗しました' }
  }
}

/**
 * リダイレクト認証の結果を処理する
 * アプリ起動時に1回だけ呼ぶ。signInAnonymouslyIfNeeded() より先に呼ぶこと。
 */
export async function handleRedirectResult(): Promise<{
  redirectOccurred: boolean
  user?: User
  error?: string
  errorCode?: string
}> {
  const auth = getFirebaseAuth()
  if (!auth) return { redirectOccurred: false }

  try {
    const result = await getRedirectResult(auth)
    if (!result) {
      // リダイレクトなし（通常の起動）
      return { redirectOccurred: false }
    }
    // リダイレクト認証成功
    console.log('[Auth] リダイレクト認証成功:', result.user.uid)
    return { redirectOccurred: true, user: result.user }
  } catch (error: unknown) {
    const authError = error as { code?: string }

    if (authError.code === 'auth/credential-already-in-use') {
      // リダイレクト後の credential-already-in-use
      // リダイレクト経由ではcredential復元が難しいため、シンプルなエラーメッセージを返す
      return {
        redirectOccurred: true,
        error: 'このGoogleアカウントは別の端末で使われています。そちらの端末でログアウトしてから、もう一度お試しください。',
        errorCode: authError.code,
      }
    }

    console.error('[Auth] リダイレクト認証失敗:', error)
    return {
      redirectOccurred: true,
      error: 'Googleログインに失敗しました。もう一度お試しください。',
      errorCode: authError.code,
    }
  }
}

/**
 * 既存のGoogleアカウントでログインする
 * linkWithGoogle() が credential-already-in-use で失敗したとき、
 * ユーザーが「既存データを使う」を選んだ場合に呼ぶ
 */
export async function signInWithExistingGoogle(
  credential: NonNullable<ReturnType<typeof GoogleAuthProvider.credentialFromError>>
): Promise<User | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null

  try {
    const result = await signInWithCredential(auth, credential)
    console.log('[Auth] 既存Googleアカウントでログイン:', result.user.uid)
    return result.user
  } catch (error) {
    console.error('[Auth] 既存アカウントでのログイン失敗:', error)
    return null
  }
}

/**
 * ログアウトして新しい匿名ユーザーに戻る
 */
export async function signOutAndRevertToAnonymous(): Promise<User | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null

  try {
    // Googleセッションを解除
    await firebaseSignOut(auth)
    console.log('[Auth] ログアウト完了')

    // 新しい匿名ユーザーとしてログイン
    const credential = await signInAnonymously(auth)
    console.log('[Auth] 新しい匿名ユーザー:', credential.user.uid)
    return credential.user
  } catch (error) {
    console.error('[Auth] ログアウト/匿名ログイン失敗:', error)
    return null
  }
}
