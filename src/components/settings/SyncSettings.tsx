import { useState } from 'react'
import { Icon } from '../common/Icon'
import { useSyncStore } from '../../store/syncStore'
import { isFirebaseConfigured } from '../../lib/firebase'
import { signInAnonymouslyIfNeeded } from '../../services/authService'
import { createFamilyGroup, findGroupByCode, joinFamilyGroup, getFamilyGroup } from '../../services/familyGroup'
import { uploadAllItems, startRealtimeSync, stopRealtimeSync } from '../../services/sync'

export function SyncSettings() {
  const mode = useSyncStore((s) => s.mode)
  const status = useSyncStore((s) => s.status)
  const familyCode = useSyncStore((s) => s.familyCode)
  const familyGroupId = useSyncStore((s) => s.familyGroupId)
  const setFamilyGroup = useSyncStore((s) => s.setFamilyGroup)
  const setUserId = useSyncStore((s) => s.setUserId)
  const clearFamilyGroup = useSyncStore((s) => s.clearFamilyGroup)
  const setError = useSyncStore((s) => s.setError)

  const [inputCode, setInputCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [memberCount, setMemberCount] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  // Firebase未設定の場合
  if (!isFirebaseConfigured()) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Icon name="group" size={20} />
          家族で共有
        </h3>
        <p className="text-sm text-gray-500">
          この機能はまだ設定されていません。
        </p>
      </div>
    )
  }

  /**
   * 共有を開始する（新しいグループを作成）
   */
  const handleCreateGroup = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const user = await signInAnonymouslyIfNeeded()
      if (!user) {
        setMessage('ログインに失敗しました。ネットワーク接続を確認してもう一度お試しください')
        return
      }
      setUserId(user.uid)

      const result = await createFamilyGroup(user.uid)
      if (!result) {
        setMessage('グループの作成に失敗しました')
        return
      }

      setFamilyGroup(result.groupId, result.code)

      // ローカルのアイテムをアップロード
      await uploadAllItems()

      // リアルタイム同期開始
      startRealtimeSync()

      setMessage('共有を開始しました！家族に招待コードを教えてください')
    } catch (error) {
      console.error('グループ作成エラー:', error)
      setMessage('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 招待コードでグループに参加
   */
  const handleJoinGroup = async () => {
    if (inputCode.length !== 6) {
      setMessage('6桁のコードを入力してください')
      return
    }

    setIsLoading(true)
    setMessage(null)
    try {
      const user = await signInAnonymouslyIfNeeded()
      if (!user) {
        setMessage('ログインに失敗しました。ネットワーク接続を確認してもう一度お試しください')
        return
      }
      setUserId(user.uid)

      const group = await findGroupByCode(inputCode)
      if (!group) {
        setMessage('このコードのグループが見つかりません')
        return
      }

      const result = await joinFamilyGroup(group.groupId, user.uid)
      if (!result.success) {
        setMessage(result.error ?? 'グループへの参加に失敗しました')
        return
      }

      setFamilyGroup(group.groupId, group.code)

      // ローカルのアイテムをアップロード
      await uploadAllItems()

      // リアルタイム同期開始
      startRealtimeSync()

      setMessage('グループに参加しました！')
    } catch (error) {
      console.error('参加エラー:', error)
      setMessage('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 共有を解除する
   */
  const handleLeaveGroup = () => {
    stopRealtimeSync()
    clearFamilyGroup()
    setError(null)
    setMessage('共有を解除しました。ローカルモードに戻ります。')
  }

  /**
   * 招待コードをコピー
   */
  const handleCopyCode = async () => {
    if (!familyCode) return
    try {
      await navigator.clipboard.writeText(familyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // フォールバック
      setMessage(`招待コード: ${familyCode}`)
    }
  }

  /**
   * グループ情報を読み込む
   */
  const loadGroupInfo = async () => {
    if (!familyGroupId) return
    const info = await getFamilyGroup(familyGroupId)
    if (info) {
      setMemberCount(info.memberCount)
    }
  }

  // 共有中の場合
  if (mode === 'shared' && familyGroupId) {
    // 初回だけグループ情報を読み込む
    if (memberCount === 0) {
      loadGroupInfo()
    }

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Icon name="group" size={20} />
          家族で共有中
        </h3>

        {/* 同期状態 */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-green-500' :
            status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            status === 'error' ? 'bg-red-500' :
            'bg-gray-400'
          }`} />
          <span className="text-gray-600">
            {status === 'connected' ? 'リアルタイム同期中' :
             status === 'connecting' ? '接続中...' :
             status === 'error' ? '接続エラー' :
             '未接続'}
          </span>
          {memberCount > 0 && (
            <span className="text-gray-400 ml-auto">{memberCount}人のメンバー</span>
          )}
        </div>

        {/* 招待コード */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">招待コード（家族に共有してください）</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold tracking-widest text-gray-800">
              {familyCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100"
            >
              <Icon name="content_copy" size={16} />
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          </div>
        </div>

        {/* 共有解除 */}
        <button
          onClick={handleLeaveGroup}
          className="w-full py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Icon name="logout" size={16} className="inline mr-1" />
          共有を解除する
        </button>

        {message && (
          <p className="text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    )
  }

  // 未共有の場合
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Icon name="group" size={20} />
        家族で共有
      </h3>
      <p className="text-sm text-gray-500">
        家族とリアルタイムで買い物リストを共有できます。
      </p>

      {/* 新しいグループを作成 */}
      <button
        onClick={handleCreateGroup}
        disabled={isLoading}
        className="w-full py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Icon name="sync" size={20} className="animate-spin" />
        ) : (
          <Icon name="link" size={20} />
        )}
        共有を始める
      </button>

      {/* 区切り線 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">または</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* コードで参加 */}
      <div>
        <p className="text-sm text-gray-600 mb-2">家族コードで参加する</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="6桁のコード"
            maxLength={6}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-center font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleJoinGroup}
            disabled={isLoading || inputCode.length !== 6}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium disabled:opacity-50"
          >
            参加
          </button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-center text-amber-600">{message}</p>
      )}
    </div>
  )
}
