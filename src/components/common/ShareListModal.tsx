import { useState } from 'react'
import { Icon } from './Icon'
import { useListStore } from '../../store/listStore'
import { useSyncStore } from '../../store/syncStore'
import { generateAndSetShareCode, findListByShareCode, joinList } from '../../services/listService'
import { startListSync } from '../../services/sync'
import type { ShoppingList } from '../../types/list'

interface ShareListModalProps {
  isOpen: boolean
  onClose: () => void
  /** 共有コードを生成するリスト（nullなら「コードで参加」モード） */
  list: ShoppingList | null
}

/**
 * リスト共有モーダル
 * - リストを選んで開く → 共有コード生成＆表示
 * - リストなしで開く → コードを入力して参加
 */
export function ShareListModal({ isOpen, onClose, list }: ShareListModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [copied, setCopied] = useState(false)
  const [inputCode, setInputCode] = useState('')

  const authProvider = useSyncStore((s) => s.authProvider)
  const userId = useSyncStore((s) => s.userId)
  const setShareCode = useListStore((s) => s.setShareCode)
  const addMember = useListStore((s) => s.addMember)
  const mergeListsFromCloud = useListStore((s) => s.mergeListsFromCloud)
  const setActiveListId = useListStore((s) => s.setActiveListId)

  if (!isOpen) return null

  // Googleログインしていない場合
  if (authProvider === 'anonymous') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-[90%] max-w-sm p-6 space-y-4">
          <h3 className="font-bold text-lg text-gray-800">リスト共有</h3>
          <p className="text-sm text-gray-500">
            リストを共有するには、先にGoogleアカウントでログインしてください。
          </p>
          <p className="text-xs text-gray-400">
            設定 → アカウント → Googleでログイン
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  }

  // 共有コードを生成
  const handleGenerateCode = async () => {
    if (!list) return
    setIsLoading(true)
    setMessage(null)

    try {
      const code = await generateAndSetShareCode(list)
      if (code) {
        setShareCode(list.id, code)
        setMessage('共有コードを作成しました')
        setMessageType('success')
      } else {
        setMessage('共有コードの生成に失敗しました。ブラウザのコンソールでエラー詳細を確認できます。')
        setMessageType('error')
      }
    } catch (error) {
      console.error('[ShareListModal] 共有コード生成で予期しないエラー:', error)
      setMessage('予期しないエラーが発生しました')
      setMessageType('error')
    }
    setIsLoading(false)
  }

  // コピー
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setMessage(`共有コード: ${code}`)
      setMessageType('success')
    }
  }

  // コードで参加
  const handleJoin = async () => {
    if (inputCode.length !== 6) {
      setMessage('6桁のコードを入力してください')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage(null)

    // コードでリストを検索
    const foundList = await findListByShareCode(inputCode)
    if (!foundList) {
      setMessage('このコードのリストが見つかりません')
      setMessageType('error')
      setIsLoading(false)
      return
    }

    // リストに参加
    const result = await joinList(foundList.id, userId)
    if (!result.success) {
      setMessage(result.error ?? 'リストへの参加に失敗しました')
      setMessageType('error')
      setIsLoading(false)
      return
    }

    // ローカルのリストストアに追加
    addMember(foundList.id, userId)
    mergeListsFromCloud([foundList])
    setActiveListId(foundList.id)

    // リアルタイム同期開始
    startListSync(foundList.id)

    setMessage(`「${foundList.name}」に参加しました！`)
    setMessageType('success')
    setIsLoading(false)
    setInputCode('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-[90%] max-w-sm p-6 space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800">
            {list ? 'リストを共有' : '共有リストに参加'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" size={24} />
          </button>
        </div>

        {list ? (
          // --- 共有コード表示モード ---
          <>
            <p className="text-sm text-gray-500">
              「{list.name}」の共有コードを家族に教えてください。
            </p>

            {list.shareCode ? (
              // コードが既にある
              <div className="bg-gray-50 rounded-lg p-4 text-center space-y-3">
                <p className="text-xs text-gray-500">共有コード</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-gray-800">
                  {list.shareCode}
                </p>
                <button
                  onClick={() => handleCopy(list.shareCode!)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 mx-auto"
                >
                  <Icon name="content_copy" size={16} />
                  {copied ? 'コピーしました！' : 'コピー'}
                </button>
              </div>
            ) : (
              // コードを生成
              <button
                onClick={handleGenerateCode}
                disabled={isLoading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Icon name="sync" size={20} className="animate-spin" />
                ) : (
                  <Icon name="share" size={20} />
                )}
                共有コードを作成
              </button>
            )}

            <p className="text-xs text-gray-400 text-center">
              コードを知っている人は誰でもこのリストに参加できます
            </p>
          </>
        ) : (
          // --- コードで参加モード ---
          <>
            <p className="text-sm text-gray-500">
              家族から教えてもらった6桁のコードを入力してください。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="6桁のコード"
                maxLength={6}
                className="flex-1 px-3 py-3 border border-gray-200 rounded-lg text-center font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={isLoading || inputCode.length !== 6}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Icon name="sync" size={20} className="animate-spin" />
              ) : (
                <Icon name="group_add" size={20} />
              )}
              参加する
            </button>
          </>
        )}

        {message && (
          <p className={`text-sm text-center ${messageType === 'error' ? 'text-amber-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
