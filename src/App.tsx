import { useState, useEffect } from 'react'
import type { StockItem } from './types'
import { loadItems, saveItems } from './services/storage'

function App() {
  const [items, setItems] = useState<StockItem[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCount, setNewCount] = useState(1)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')

  useEffect(() => {
    setItems(loadItems())
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      saveItems(items)
    }
  }, [items])

  const updateCount = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nc = item.count + delta
        return { ...item, count: nc < 0 ? 0 : nc }
      }
      return item
    }))
    if (selectedItem && selectedItem.id === id) {
      const nc = selectedItem.count + delta
      setSelectedItem({ ...selectedItem, count: nc < 0 ? 0 : nc })
    }
  }

  const addItem = () => {
    if (!newName.trim()) return
    const newItem: StockItem = {
      id: Date.now().toString(),
      name: newName,
      count: newCount,
      buyUrl: newUrl,
      category: '',
      imageUrl: '',
      createdAt: new Date().toISOString(),
    }
    setItems([...items, newItem])
    setNewName('')
    setNewUrl('')
    setNewCount(1)
    setIsAddModalOpen(false)
  }

  const deleteItem = (id: string) => {
    if (confirm('この商品を削除しますか？')) {
      setItems(items.filter(item => item.id !== id))
      setSelectedItem(null)
    }
  }

  const startEdit = () => {
    if (selectedItem) {
      setEditName(selectedItem.name)
      setEditUrl(selectedItem.buyUrl)
      setIsEditing(true)
    }
  }

  const saveEdit = () => {
    if (!selectedItem || !editName.trim()) return
    const updated = { ...selectedItem, name: editName, buyUrl: editUrl }
    setItems(items.map(item => item.id === selectedItem.id ? updated : item))
    setSelectedItem(updated)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow">
        <h1 className="text-xl font-bold">カイタス</h1>
      </header>

      <main className="p-4 pb-20">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>商品がありません</p>
            <p className="text-sm mt-2">右下の + ボタンから追加してください</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer">
                <div className="flex-1 mr-4">
                  <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                  {item.count === 0 && <p className="text-red-500 text-xs mt-1">在庫なし</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); updateCount(item.id, -1) }} className="w-8 h-8 bg-gray-200 rounded-full text-lg font-bold">-</button>
                  <span className="text-lg font-bold w-8 text-center">{item.count}</span>
                  <button onClick={(e) => { e.stopPropagation(); updateCount(item.id, 1) }} className="w-8 h-8 bg-gray-200 rounded-full text-lg font-bold">+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-gray-800 text-white rounded-full text-2xl shadow-lg">+</button>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">商品の追加</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">商品名</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例：ボディソープ" className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">購入URL</label>
                <input type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://www.amazon.co.jp/..." className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">初期在庫数</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNewCount(Math.max(0, newCount - 1))} className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold">-</button>
                  <span className="text-xl font-bold w-8 text-center">{newCount}</span>
                  <button onClick={() => setNewCount(newCount + 1)} className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold">+</button>
                </div>
              </div>
              <button onClick={addItem} className="w-full p-3 bg-gray-800 text-white rounded-lg font-bold">追加する</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6">
            <div className="flex justify-end mb-2">
              <button onClick={() => { setSelectedItem(null); setIsEditing(false) }} className="text-2xl">×</button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">商品名</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">購入URL</label>
                  <input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <div className="flex gap-3">
                  <button onClick={cancelEdit} className="flex-1 p-3 bg-gray-200 rounded-lg font-bold">キャンセル</button>
                  <button onClick={saveEdit} className="flex-1 p-3 bg-gray-800 text-white rounded-lg font-bold">保存</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4"></div>
                <h2 className="text-lg font-bold text-center mb-4">{selectedItem.name}</h2>
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => updateCount(selectedItem.id, -1)} className="w-12 h-12 bg-gray-200 rounded-full text-xl font-bold">-</button>
                  <span className="text-2xl font-bold w-12 text-center">{selectedItem.count}</span>
                  <button onClick={() => updateCount(selectedItem.id, 1)} className="w-12 h-12 bg-gray-200 rounded-full text-xl font-bold">+</button>
                </div>
                {selectedItem.buyUrl && (
                  <a href={selectedItem.buyUrl} target="_blank" rel="noopener noreferrer" className="w-full p-3 bg-gray-800 text-white rounded-lg font-bold text-center block mb-3">Amazonで買う</a>
                )}
                <div className="flex gap-3 w-full">
                  <button onClick={startEdit} className="flex-1 p-3 bg-gray-200 rounded-lg font-bold">編集</button>
                  <button onClick={() => deleteItem(selectedItem.id)} className="flex-1 p-3 bg-red-500 text-white rounded-lg font-bold">削除</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App