import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SyncMode = 'local' | 'shared'
type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'saving'

interface SyncStore {
  // 同期モード（ローカルのみ or 家族共有）
  mode: SyncMode
  // 接続状態
  status: SyncStatus
  // ユーザーID（Firebase匿名認証のUID）
  userId: string
  // 家族グループID
  familyGroupId: string | null
  // 家族招待コード
  familyCode: string | null
  // 節約モード（使用量95%以上で自動発動）
  savingMode: boolean
  // エラーメッセージ
  errorMessage: string | null

  // アクション
  setMode: (mode: SyncMode) => void
  setStatus: (status: SyncStatus) => void
  setUserId: (userId: string) => void
  setFamilyGroup: (groupId: string, code: string) => void
  clearFamilyGroup: () => void
  setSavingMode: (saving: boolean) => void
  setError: (message: string | null) => void
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

      setMode: (mode) => set({ mode }),
      setStatus: (status) => set({ status }),
      setUserId: (userId) => set({ userId }),
      setFamilyGroup: (groupId, code) =>
        set({ familyGroupId: groupId, familyCode: code, mode: 'shared' }),
      clearFamilyGroup: () =>
        set({ familyGroupId: null, familyCode: null, mode: 'local', status: 'disconnected' }),
      setSavingMode: (saving) => set({ savingMode: saving }),
      setError: (message) => set({ errorMessage: message }),
    }),
    {
      name: 'kaitas-sync',
      partialize: (state) => ({
        mode: state.mode,
        userId: state.userId,
        familyGroupId: state.familyGroupId,
        familyCode: state.familyCode,
      }),
    }
  )
)
