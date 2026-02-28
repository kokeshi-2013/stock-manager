import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icon'
import { useListStore } from '../../store/listStore'
import { useItemStore } from '../../store/itemStore'
import { MAX_LIST_COUNT } from '../../types/list'

/**
 * ヘッダーに表示するリスト切り替えドロップダウン
 */
export function ListSelector() {
  const lists = useListStore((s) => s.lists)
  const activeListId = useListStore((s) => s.activeListId)
  const setActiveListId = useListStore((s) => s.setActiveListId)
  const createList = useListStore((s) => s.createList)
  const getItemCountByList = useItemStore((s) => s.getItemCountByList)

  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeList = lists.find((l) => l.id === activeListId)

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsCreating(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // 作成モード開始時にフォーカス
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  const handleSelectList = (listId: string) => {
    setActiveListId(listId)
    setIsOpen(false)
    setIsCreating(false)
  }

  const handleCreateList = () => {
    const trimmed = newListName.trim()
    if (!trimmed) return
    const result = createList(trimmed)
    if (result) {
      setNewListName('')
      setIsCreating(false)
      setIsOpen(false)
    }
  }

  // リストが1つだけの場合はセレクターを表示しない（シンプルに保つ）
  // ただし設定からは常にリスト管理にアクセス可能
  if (lists.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* セレクターボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors max-w-[160px]"
      >
        <span className="text-sm font-medium text-gray-700 truncate">
          {activeList?.name ?? 'リスト'}
        </span>
        <Icon
          name="expand_more"
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[220px] z-50 overflow-hidden">
          {/* リスト一覧 */}
          <div className="py-1 max-h-[300px] overflow-y-auto">
            {lists.map((list) => {
              const isActive = list.id === activeListId
              const itemCount = getItemCountByList(list.id)
              const isMemberShared = list.memberUids.length > 1

              return (
                <button
                  key={list.id}
                  onClick={() => handleSelectList(list.id)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-primary-light' : ''
                  }`}
                >
                  {isActive && (
                    <Icon name="check" size={16} className="text-primary flex-shrink-0" />
                  )}
                  {!isActive && <div className="w-4" />}
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm truncate ${isActive ? 'font-medium text-primary' : 'text-gray-700'}`}>
                      {list.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {itemCount}アイテム
                      {isMemberShared && ` · 👥${list.memberUids.length}人`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 区切り線 */}
          <div className="border-t border-gray-100" />

          {/* 新しいリスト作成 */}
          {isCreating ? (
            <div className="p-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateList()
                  if (e.key === 'Escape') {
                    setIsCreating(false)
                    setNewListName('')
                  }
                }}
                placeholder="リスト名"
                maxLength={30}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg disabled:opacity-40"
              >
                作成
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (lists.length >= MAX_LIST_COUNT) return
                setIsCreating(true)
              }}
              disabled={lists.length >= MAX_LIST_COUNT}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="add" size={16} className="text-primary" />
              <span className="text-sm text-primary font-medium">新しいリスト</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
