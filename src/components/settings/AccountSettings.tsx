import { useState, useEffect, useCallback } from 'react'
import { Icon } from '../common/Icon'
import { isFirebaseConfigured } from '../../lib/firebase'
import { useSyncStore } from '../../store/syncStore'
import {
  linkWithGoogle,
  signOutAndRevertToAnonymous,
  signInWithExistingGoogle,
  getAuthProviderInfo,
} from '../../services/authService'
import { stopRealtimeSync } from '../../services/sync'

/**
 * Google公式ロゴ（4色のG）
 */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function AccountSettings() {
  const authProvider = useSyncStore((s) => s.authProvider)
  const displayName = useSyncStore((s) => s.displayName)
  const email = useSyncStore((s) => s.email)
  const photoURL = useSyncStore((s) => s.photoURL)
  const isLinkingAccount = useSyncStore((s) => s.isLinkingAccount)

  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)
  const [pendingCredential, setPendingCredential] = useState<Parameters<typeof signInWithExistingGoogle>[0] | null>(null)

  // リダイレクト認証エラーをチェック（モバイルでGoogleログイン後に戻ってきた場合）
  useEffect(() => {
    const storedError = sessionStorage.getItem('kaitas-link-error')
    if (storedError) {
      sessionStorage.removeItem('kaitas-link-error')
      setMessage(storedError)
      setMessageType('error')
    }
  }, [])

  // Googleでログイン（匿名アカウントをGoogleに昇格）
  const handleGoogleSignIn = useCallback(async () => {
    useSyncStore.getState().setIsLinkingAccount(true)
    setMessage(null)

    const result = await linkWithGoogle()

    if (result.success && result.user) {
      // ポップアップ方式で成功（PC）
      const authInfo = getAuthProviderInfo(result.user)
      useSyncStore.getState().setAuthInfo(authInfo)
      useSyncStore.getState().setUserId(result.user.uid)
      setMessage('Googleアカウントを連携しました')
      setMessageType('success')
      useSyncStore.getState().setIsLinkingAccount(false)
    } else if (result.success && !result.user) {
      // リダイレクト方式が始まった（モバイル）→ ページ遷移中なので何もしない
      return
    } else if (result.errorCode === 'auth/credential-already-in-use' && result.existingCredential) {
      // このGoogleアカウントは別のユーザーに紐づいている → 確認ダイアログ
      setPendingCredential(result.existingCredential)
      setShowMigrationDialog(true)
      useSyncStore.getState().setIsLinkingAccount(false)
    } else {
      // その他のエラー
      setMessage(result.error ?? 'エラーが発生しました')
      setMessageType('error')
      useSyncStore.getState().setIsLinkingAccount(false)
    }
  }, [])

  // 「既存データを使う」を選択（credential-already-in-use の解決）
  const handleMigrateToExisting = useCallback(async () => {
    if (!pendingCredential) return

    useSyncStore.getState().setIsLinkingAccount(true)

    const user = await signInWithExistingGoogle(pendingCredential)
    if (user) {
      const authInfo = getAuthProviderInfo(user)
      useSyncStore.getState().setAuthInfo(authInfo)
      useSyncStore.getState().setUserId(user.uid)

      // 家族共有をリセット（UIDが変わったため）
      stopRealtimeSync()
      useSyncStore.getState().clearFamilyGroup()

      setMessage('既存のアカウントでログインしました')
      setMessageType('success')
    } else {
      setMessage('ログインに失敗しました')
      setMessageType('error')
    }

    setShowMigrationDialog(false)
    setPendingCredential(null)
    useSyncStore.getState().setIsLinkingAccount(false)
  }, [pendingCredential])

  // ログアウト
  const handleSignOut = useCallback(async () => {
    const user = await signOutAndRevertToAnonymous()
    if (user) {
      useSyncStore.getState().clearAuthInfo()
      useSyncStore.getState().setUserId(user.uid)

      // 家族共有をリセット（新しいUIDになるため）
      stopRealtimeSync()
      useSyncStore.getState().clearFamilyGroup()

      setMessage('ログアウトしました')
      setMessageType('success')
    }
  }, [])

  // Firebase未設定の場合は非表示
  if (!isFirebaseConfigured()) {
    return null
  }

  // --- ログイン済みの表示 ---
  if (authProvider === 'google') {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Icon name="person" size={20} />
          アカウント
        </h3>

        {/* プロフィール情報 */}
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img
              src={photoURL}
              alt=""
              className="w-10 h-10 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Icon name="person" size={24} className="text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-800 truncate">{displayName ?? 'ユーザー'}</p>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
        </div>

        {/* 連携済みバッジ */}
        <div className="bg-primary-light rounded-lg p-3 flex items-center gap-2">
          <Icon name="verified_user" size={18} className="text-primary" />
          <span className="text-sm text-primary font-medium">Googleアカウント連携済み</span>
        </div>

        {/* ログアウトボタン */}
        <button
          onClick={handleSignOut}
          className="w-full py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-1"
        >
          <Icon name="logout" size={16} />
          ログアウト
        </button>

        {message && (
          <p className={`text-sm text-center ${messageType === 'error' ? 'text-amber-600' : 'text-gray-600'}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // --- 匿名ユーザーの表示 ---
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Icon name="person" size={20} />
        アカウント
      </h3>

      <p className="text-sm text-gray-500">
        Googleアカウントでログインすると、端末を変えてもデータを引き継げます。
      </p>

      {/* Googleでログインボタン */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLinkingAccount}
        className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 rounded-lg font-medium flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isLinkingAccount ? (
          <Icon name="sync" size={20} className="animate-spin" />
        ) : (
          <GoogleLogo />
        )}
        Googleでログイン
      </button>

      {/* Apple（準備中） */}
      <button
        disabled
        className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-medium flex items-center justify-center gap-3 cursor-not-allowed"
      >
        Appleでログイン（準備中）
      </button>

      <p className="text-xs text-gray-400 text-center">
        ログインしても、今のデータはそのまま引き継がれます
      </p>

      {message && (
        <p className={`text-sm text-center ${messageType === 'error' ? 'text-amber-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}

      {/* credential-already-in-use 確認ダイアログ */}
      {showMigrationDialog && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-amber-800">
            このGoogleアカウントは別の端末で使われています
          </p>
          <p className="text-xs text-amber-700">
            「既存データを使う」を選ぶと、そちらのデータに切り替わります。今この端末にあるデータは使えなくなります。
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleMigrateToExisting}
              disabled={isLinkingAccount}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              既存データを使う
            </button>
            <button
              onClick={() => {
                setShowMigrationDialog(false)
                setPendingCredential(null)
              }}
              className="flex-1 py-2 bg-white border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
