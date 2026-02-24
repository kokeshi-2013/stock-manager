import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import TopPage from './pages/TopPage'
import SettingsPage from './pages/SettingsPage'
import { initializeFirebase } from './lib/firebase'
import { signInAnonymouslyIfNeeded } from './services/authService'
import { useSyncStore } from './store/syncStore'
import { startRealtimeSync } from './services/sync'

// Firebase初期化（環境変数が設定されている場合のみ）
const firebase = initializeFirebase()
if (firebase) {
  // 匿名認証 → 共有モードならリアルタイム同期を再開
  signInAnonymouslyIfNeeded().then((user) => {
    if (user) {
      useSyncStore.getState().setUserId(user.uid)
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
