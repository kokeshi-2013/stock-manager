import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'saving'
export type AuthProvider = 'anonymous' | 'google' | 'apple'

interface AuthInfo {
  authProvider: AuthProvider
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface SyncStore {
  // 接続状態（全体）
  status: SyncStatus
  // ユーザーID（Firebase認証のUID）
  userId: string
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

  // === 後方互換用（v2からの移行中に参照される） ===
  /** @deprecated v3でlistStoreに移行。マイグレーション用に残す。 */
  mode?: 'local' | 'shared'
  /** @deprecated v3でlistStoreに移行。マイグレーション用に残す。 */
  familyGroupId?: string | null
  /** @deprecated v3でlistStoreに移行。マイグレーション用に残す。 */
  familyCode?: string | null

  // アクション
  setStatus: (status: SyncStatus) => void
  setUserId: (userId: string) => void
  setSavingMode: (saving: boolean) => void
  setError: (message: string | null) => void
  setAuthInfo: (info: AuthInfo) => void
  setIsLinkingAccount: (linking: boolean) => void
  clearAuthInfo: () => void

  // === 後方互換アクション（Phase D/E完了まで使う） ===
  /** @deprecated Phase C完了後に削除 */
  setFamilyGroup: (groupId: string, code: string) => void
  /** @deprecated Phase C完了後に削除 */
  clearFamilyGroup: () => void
  /** @deprecated Phase C完了後に削除 */
  setMode: (mode: 'local' | 'shared') => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      status: 'disconnected',
      userId: 'local-user',
      savingMode: false,
      errorMessage: null,
      authProvider: 'anonymous' as AuthProvider,
      displayName: null,
      email: null,
      photoURL: null,
      isLinkingAccount: false,
      // 後方互換
      mode: 'local' as const,
      familyGroupId: null,
      familyCode: null,

      setStatus: (status) => set({ status }),
      setUserId: (userId) => set({ userId }),
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
      // 後方互換アクション
      setFamilyGroup: (groupId, code) =>
        set({ familyGroupId: groupId, familyCode: code, mode: 'shared' }),
      clearFamilyGroup: () =>
        set({ familyGroupId: null, familyCode: null, mode: 'local', status: 'disconnected' }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'kaitas-sync',
      partialize: (state) => ({
        userId: state.userId,
        authProvider: state.authProvider,
        displayName: state.displayName,
        email: state.email,
        photoURL: state.photoURL,
        // 後方互換（既存ユーザーのlocalStorageを壊さないために残す）
        mode: state.mode,
        familyGroupId: state.familyGroupId,
        familyCode: state.familyCode,
      }),
    }
  )
)
