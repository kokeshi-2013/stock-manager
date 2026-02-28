import { useState } from 'react'
import { Icon } from '../common/Icon'
import { useListStore } from '../../store/listStore'
import { useItemStore } from '../../store/itemStore'
import { MAX_LIST_COUNT } from '../../types/list'
import { ShareListModal } from '../common/ShareListModal'
import type { ShoppingList } from '../../types/list'

/**
 * 設定ページのリスト管理セクション
 * リストの作成・編集・削除・共有コードの確認ができる
 */
export function ListManagement() {
  const lists = useListStore((s) => s.lists)
  const activeListId = useListStore((s) => s.activeListId)
  const createList = useListStore((s) => s.createList)
  const renameList = useListStore((s) => s.renameList)
  const deleteList = useListStore((s) => s.deleteList)
  const setActiveListId = useListStore((s) => s.setActiveListId)
  const getItemCountByList = useItemStore((s) => s.getItemCountByList)
  const deleteItemsByList = useItemStore((s) => s.deleteItemsByList)

  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<ShoppingList | null>(null)

  const handleCreate = () => {
    const trimmed = newListName.trim()
    if (!trimmed) return
    const result = createList(trimmed)
    if (result) {
      setNewListName('')
      setIsCreating(false)
    }
  }

  const handleStartEdit = (listId: string, currentName: string) => {
    setEditingId(listId)
    setEditName(currentName)
  }

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameList(editingId, editName.trim())
      setEditingId(null)
    }
  }

  const handleDelete = (listId: string) => {
    // アイテムも一緒に削除
    deleteItemsByList(listId)
    deleteList(listId)
    setDeletingId(null)
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Icon name="list" size={20} />
        リスト管理
      </h3>

      {/* リスト一覧 */}
      <div className="space-y-2">
        {lists.map((list) => {
          const itemCount = getItemCountByList(list.id)
          const isActive = list.id === activeListId
          const isEditing = editingId === list.id
          const isDeleting = deletingId === list.id
          const isMemberShared = list.memberUids.length > 1

          return (
            <div
              key={list.id}
              className={`rounded-lg border p-3 ${isActive ? 'border-primary bg-primary-light/30' : 'border-gray-200'}`}
            >
              {isDeleting ? (
                // 削除確認
                <div className="space-y-2">
                  <p className="text-sm text-red-600 font-medium">
                    「{list.name}」を削除しますか？
                  </p>
                  <p className="text-xs text-gray-500">
                    {itemCount}件のアイテムも一緒に削除されます。この操作は取り消せません。
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="flex-1 py-1.5 bg-red-500 text-white text-sm rounded-lg"
                    >
                      削除する
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                // 名前編集
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    maxLength={30}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editName.trim()}
                    className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg disabled:opacity-40"
                  >
                    保存
                  </button>
                </div>
              ) : (
                // 通常表示
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 truncate text-sm">{list.name}</p>
                      {isActive && (
                        <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                          選択中
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{itemCount}アイテム</span>
                      {isMemberShared ? (
                        <span className="text-xs text-gray-400">
                          · 共有中（{list.memberUids.length}人）
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">· 自分だけ</span>
                      )}
                      {list.shareCode && (
                        <span className="text-xs text-gray-400">· コード: {list.shareCode}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => setActiveListId(list.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                        title="このリストを選択"
                      >
                        <Icon name="check_circle" size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShareTarget(list)
                        setShareModalOpen(true)
                      }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500"
                      title="共有"
                    >
                      <Icon name="share" size={18} />
                    </button>
                    <button
                      onClick={() => handleStartEdit(list.id, list.name)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                      title="名前を変更"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    {lists.length > 1 && (
                      <button
                        onClick={() => setDeletingId(list.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                        title="削除"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 新しいリスト作成 */}
      {isCreating ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') {
                setIsCreating(false)
                setNewListName('')
              }
            }}
            placeholder="リスト名を入力"
            maxLength={30}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={!newListName.trim()}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium disabled:opacity-40"
          >
            作成
          </button>
          <button
            onClick={() => {
              setIsCreating(false)
              setNewListName('')
            }}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          disabled={lists.length >= MAX_LIST_COUNT}
          className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-primary rounded-lg text-sm text-gray-500 hover:text-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="add" size={18} />
          新しいリストを作る
        </button>
      )}

      {lists.length >= MAX_LIST_COUNT && (
        <p className="text-xs text-gray-400 text-center">
          リストは最大{MAX_LIST_COUNT}個まで作成できます
        </p>
      )}

      {/* 区切り線 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">または</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 共有コードで参加 */}
      <button
        onClick={() => {
          setShareTarget(null)
          setShareModalOpen(true)
        }}
        className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 flex items-center justify-center gap-2"
      >
        <Icon name="group_add" size={18} />
        共有コードで参加する
      </button>

      {/* 共有モーダル */}
      <ShareListModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        list={shareTarget}
      />
    </div>
  )
}
