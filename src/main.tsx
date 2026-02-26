import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import TopPage from './pages/TopPage'
import SettingsPage from './pages/SettingsPage'
import { initializeFirebase } from './lib/firebase'
import { handleRedirectResult, signInAnonymouslyIfNeeded, getAuthProviderInfo } from './services/authService'
import { useSyncStore } from './store/syncStore'
import { startRealtimeSync } from './services/sync'

// Firebase初期化（環境変数が設定されている場合のみ）
const firebase = initializeFirebase()
if (firebase) {
  // 起動フロー:
  // 1. リダイレクト認証の結果をチェック（Googleログイン後の戻りかもしれない）
  // 2. リダイレクトなしなら匿名認証
  // 3. ユーザー情報をストアにセット
  // 4. 共有モードならリアルタイム同期を再開
  handleRedirectResult().then(async (redirectResult) => {
    let user = null

    if (redirectResult.redirectOccurred && redirectResult.user) {
      // Googleログインからの戻り → そのユーザーを使う
      user = redirectResult.user
    } else if (redirectResult.redirectOccurred && redirectResult.errorCode) {
      // リダイレクト認証でエラー → sessionStorageにエラーを保存してUIで表示
      sessionStorage.setItem('kaitas-link-error', redirectResult.error ?? 'エラーが発生しました')
      // 通常の匿名認証にフォールバック
      user = await signInAnonymouslyIfNeeded()
    } else {
      // 通常の起動 → 匿名認証（既存セッションがあればそのまま）
      user = await signInAnonymouslyIfNeeded()
    }

    if (user) {
      const authInfo = getAuthProviderInfo(user)
      useSyncStore.getState().setUserId(user.uid)
      useSyncStore.getState().setAuthInfo(authInfo)

      const { mode, familyGroupId } = useSyncStore.getState()
      if (mode === 'shared' && familyGroupId) {
        startRealtimeSync()
      }
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<TopPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
