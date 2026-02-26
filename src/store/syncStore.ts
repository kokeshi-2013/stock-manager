import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SyncMode = 'local' | 'shared'
type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'saving'
export type AuthProvider = 'anonymous' | 'google' | 'apple'

interface AuthInfo {
  authProvider: AuthProvider
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface SyncStore {
  // 同期モード（ローカルのみ or 家族共有）
  mode: SyncMode
  // 接続状態
  status: SyncStatus
  // ユーザーID（Firebase認証のUID）
  userId: string
  // 家族グループID
  familyGroupId: string | null
  // 家族招待コード
  familyCode: string | null
  // 節約モード（使用量95%以上で自動発動）
  savingMode: boolean
  // エラーメッセージ
  errorMessage: string | null
  // アカウント情報
  authProvider: AuthProvider
  displayName: string | null
  email: string | null
  photoURL: string | null
  // アカウント連携中フラグ（一時的、保存しない）
  isLinkingAccount: boolean

  // アクション
  setMode: (mode: SyncMode) => void
  setStatus: (status: SyncStatus) => void
  setUserId: (userId: string) => void
  setFamilyGroup: (groupId: string, code: string) => void
  clearFamilyGroup: () => void
  setSavingMode: (saving: boolean) => void
  setError: (message: string | null) => void
  setAuthInfo: (info: AuthInfo) => void
  setIsLinkingAccount: (linking: boolean) => void
  clearAuthInfo: () => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      mode: 'local',
      status: 'disconnected',
      userId: 'local-user',
      familyGroupId: null,
      familyCode: null,
      savingMode: false,
      errorMessage: null,
      authProvider: 'anonymous' as AuthProvider,
      displayName: null,
      email: null,
      photoURL: null,
      isLinkingAccount: false,

      setMode: (mode) => set({ mode }),
      setStatus: (status) => set({ status }),
      setUserId: (userId) => set({ userId }),
      setFamilyGroup: (groupId, code) =>
        set({ familyGroupId: groupId, familyCode: code, mode: 'shared' }),
      clearFamilyGroup: () =>
        set({ familyGroupId: null, familyCode: null, mode: 'local', status: 'disconnected' }),
      setSavingMode: (saving) => set({ savingMode: saving }),
      setError: (message) => set({ errorMessage: message }),
      setAuthInfo: (info) =>
        set({
          authProvider: info.authProvider,
          displayName: info.displayName,
          email: info.email,
          photoURL: info.photoURL,
        }),
      setIsLinkingAccount: (linking) => set({ isLinkingAccount: linking }),
      clearAuthInfo: () =>
        set({
          authProvider: 'anonymous',
          displayName: null,
          email: null,
          photoURL: null,
        }),
    }),
    {
      name: 'kaitas-sync',
      partialize: (state) => ({
        mode: state.mode,
        userId: state.userId,
        familyGroupId: state.familyGroupId,
        familyCode: state.familyCode,
        authProvider: state.authProvider,
        displayName: state.displayName,
        email: state.email,
        photoURL: state.photoURL,
      }),
    }
  )
)
