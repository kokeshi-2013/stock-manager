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
import { useListStore } from './store/listStore'
import { useItemStore } from './store/itemStore'
import { startRealtimeSync, uploadAllItems } from './services/sync'
import { uploadAllLists, fetchListsForUser } from './services/listService'
import { migrateV2ToV3, cleanupV2Backup } from './services/migration'

// v2→v3マイグレーション（リスト対応）
const migrationResult = migrateV2ToV3()
if (migrationResult) {
  const { updatedItems, newLists } = migrationResult
  // アイテムストアを更新
  useItemStore.getState().bulkUpdateItems(updatedItems)
  // リストストアにリストを追加
  useListStore.getState().mergeListsFromCloud(newLists)
  // 最初のリストをアクティブに
  if (newLists.length > 0) {
    useListStore.getState().setActiveListId(newLists[0].id)
  }
}

// デフォルトリストの確保（初回起動時 or マイグレーション後）
useListStore.getState().ensureDefaultList()

// 古いバックアップの掃除（30日経過後）
cleanupV2Backup()

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

      // Googleログイン済みならクラウド同期
      if (authInfo.authProvider === 'google') {
        try {
          // ローカルリストをFirestoreにアップロード
          const localLists = useListStore.getState().lists
          await uploadAllLists(localLists)
          await uploadAllItems()

          // クラウドのリストを取得してマージ（他端末のリストを含む）
          const cloudLists = await fetchListsForUser(user.uid)
          if (cloudLists.length > 0) {
            useListStore.getState().mergeListsFromCloud(cloudLists)
          }

          // 全リストのリアルタイム同期開始
          startRealtimeSync()
        } catch (error) {
          console.error('[Main] クラウド同期の初期化エラー:', error)
        }
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
