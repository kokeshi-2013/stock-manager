import { useState, useEffect } from 'react'
import type { StockItem } from '../types'
import { loadItems, saveItems } from '../services/storage'
import { InstallPrompt } from '../components/InstallPrompt';
import { BarcodeScanner } from '../components/BarcodeScanner';

const AFFILIATE_TAG = 'kokeshi20130e-22'

const toAffiliateUrl = (url: string): string => {
  if (!url) return ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('amazon.co.jp') || u.hostname.includes('amazon.com')) {
      u.searchParams.set('tag', AFFILIATE_TAG)
      return u.toString()
    }
  } catch {
    return url
  }
  return url
}

const CATEGORIES = [
  'キッチン',
  '洗面所',
  'お風呂',
  'トイレ',
  'リビング',
  '寝室',
  '廊下',
  '玄関',
  '庭',
  '車',
  'その他',
]

function App() {
  const [items, setItems] = useState<StockItem[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'created' | 'lowStock'>('created')
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCount, setNewCount] = useState(1)
  const [newCategory, setNewCategory] = useState('')
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)

  useEffect(() => {
    setItems(loadItems())
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      saveItems(items)
    }
  }, [items])

  const usedCategories = [...new Set(items.map(item => item.category).filter(c => c))]

  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(item => selectedCategory === 'すべて' || item.category === selectedCategory)
    .sort((a, b) => {
      if (sortOrder === 'lowStock') {
        return a.count - b.count
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

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

  const handleBarcodeScan = (code: string) => {
    setShowBarcodeScanner(false)
    // Amazonで検索するURLを生成
    const amazonSearchUrl = `https://www.amazon.co.jp/s?k=${code}&tag=${AFFILIATE_TAG}`
    window.open(amazonSearchUrl, '_blank')
    // 商品追加モーダルを開く
    setIsAddModalOpen(true)
  }

  const addItem = () => {
    if (!newName.trim()) return
    const newItem: StockItem = {
      id: Date.now().toString(),
      name: newName,
      count: newCount,
      buyUrl: newUrl,
      category: newCategory,
      imageUrl: '',
      createdAt: new Date().toISOString(),
    }
    setItems([...items, newItem])
    setNewName('')
    setNewUrl('')
    setNewCount(1)
    setNewCategory('')
    setIsAddModalOpen(false)
  }

  const deleteItem = (id: string) => {
    if (confirm('この商品を削除しますか？')) {
      const newItems = items.filter(item => item.id !== id)
      setItems(newItems)
      if (newItems.length === 0) {
        saveItems([])
      }
      setSelectedItem(null)
    }
  }

  const startEdit = () => {
    if (selectedItem) {
      setEditName(selectedItem.name)
      setEditUrl(selectedItem.buyUrl)
      setEditCategory(selectedItem.category)
      setIsEditing(true)
    }
  }

  const saveEdit = () => {
    if (!selectedItem || !editName.trim()) return
    const updated = { ...selectedItem, name: editName, buyUrl: editUrl, category: editCategory }
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
        <div className="mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 キーワード検索"
            className="w-full p-2 border rounded-lg text-sm"
          />
        </div>
        <div className="mt-3">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'created' | 'lowStock')}
            className="w-full p-2 border rounded-lg text-sm bg-white"
          >
            <option value="created">登録順</option>
            <option value="lowStock">数が少ない順</option>
          </select>
        </div>
        {usedCategories.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('すべて')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === 'すべて' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
            >
              すべて
            </button>
            {usedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="p-4 pb-20">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>商品がありません</p>
            <p className="text-sm mt-2">右下の + ボタンから追加してください</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>該当する商品がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer">
                <div className="flex-1 mr-4">
                  <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                  {item.category && <p className="text-gray-500 text-xs mt-1">{item.category}</p>}
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
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">商品の追加</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setShowBarcodeScanner(true)
                  }}
                  className="w-full p-3 bg-blue-500 text-white rounded-lg font-bold mb-4 flex items-center justify-center gap-2"
                >
                  📷 バーコードをスキャン
                </button>
                <label className="block text-sm font-medium mb-1">商品名</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例：ボディソープ" className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">場所</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                  <option value="">選択してください</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
          <div className="bg-white w-full max-w-md rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium mb-1">場所</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                    <option value="">選択してください</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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
                <h2 className="text-lg font-bold text-center mb-2">{selectedItem.name}</h2>
                {selectedItem.category && <p className="text-gray-500 text-sm mb-4">{selectedItem.category}</p>}
                <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => updateCount(selectedItem.id, -1)} className="w-12 h-12 bg-gray-200 rounded-full text-xl font-bold">-</button>
                  <span className="text-2xl font-bold w-12 text-center">{selectedItem.count}</span>
                  <button onClick={() => updateCount(selectedItem.id, 1)} className="w-12 h-12 bg-gray-200 rounded-full text-xl font-bold">+</button>
                </div>
                {selectedItem.buyUrl && (
                  <a href={toAffiliateUrl(selectedItem.buyUrl)} target="_blank" rel="noopener noreferrer" className="w-full p-3 bg-gray-800 text-white rounded-lg font-bold text-center block mb-3">Amazonで買う</a>
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

      <footer className="bg-white border-t p-4 text-center">
        <button onClick={() => setShowTerms(true)} className="text-gray-500 text-sm underline">
          利用規約
        </button>
        <span className="text-gray-300 mx-2">|</span>
        <button onClick={() => setShowPrivacyPolicy(true)} className="text-gray-500 text-sm underline">
          プライバシーポリシー
        </button>
      </footer>

      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">利用規約</h2>
              <button onClick={() => setShowTerms(false)} className="text-2xl">×</button>
            </div>
            <div className="text-sm text-gray-700 space-y-4">
              <p>本利用規約（以下「本規約」）は、本アプリ「カイタス」（以下「本アプリ」）の利用条件を定めるものです。ユーザーの皆様には、本規約に同意いただいた上で、本アプリをご利用いただきます。</p>

              <h3 className="font-bold mt-4">第1条（適用）</h3>
              <p>本規約は、ユーザーと本アプリの利用に関わる一切の関係に適用されるものとします。</p>

              <h3 className="font-bold mt-4">第2条（利用について）</h3>
              <p>本アプリは、家庭用消耗品の在庫管理を目的としたサービスです。ユーザーは、本アプリを無料でご利用いただけます。</p>

              <h3 className="font-bold mt-4">第3条（データの保存）</h3>
              <p>本アプリで登録されたデータは、ユーザーのブラウザ内（ローカルストレージ）に保存されます。ブラウザのデータを削除した場合、登録したデータも削除されますのでご注意ください。</p>

              <h3 className="font-bold mt-4">第4条（禁止事項）</h3>
              <p>ユーザーは、以下の行為をしてはなりません。</p>
              <ul className="list-disc pl-5 mt-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>本アプリの運営を妨害する行為</li>
                <li>他のユーザーに迷惑をかける行為</li>
                <li>本アプリを不正に利用する行為</li>
              </ul>

              <h3 className="font-bold mt-4">第5条（免責事項）</h3>
              <p>本アプリの利用により生じた損害について、運営者は一切の責任を負いません。また、本アプリの内容、機能、利用可能性について、いかなる保証もいたしません。</p>

              <h3 className="font-bold mt-4">第6条（規約の変更）</h3>
              <p>運営者は、必要に応じて本規約を変更することができるものとします。変更後の利用規約は、本アプリ内に掲示した時点から効力を生じるものとします。</p>

              <p className="text-gray-500 mt-4">制定日：2025年1月16日</p>
            </div>
          </div>
        </div>
      )}

      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">プライバシーポリシー</h2>
              <button onClick={() => setShowPrivacyPolicy(false)} className="text-2xl">×</button>
            </div>
            <div className="text-sm text-gray-700 space-y-4">
              <p>本アプリ「カイタス」（以下「本アプリ」）は、以下のプライバシーポリシーに基づき、ユーザーの個人情報を取り扱います。</p>

              <h3 className="font-bold mt-4">1. 収集する情報</h3>
              <p>本アプリでは、ユーザーが登録した商品情報（商品名、在庫数、購入URL、カテゴリ）をお使いの端末（ブラウザのローカルストレージ）に保存します。これらの情報は外部サーバーには送信されません。</p>

              <h3 className="font-bold mt-4">2. 広告について</h3>
              <p>本アプリでは、第三者配信の広告サービス（Google AdSense、Amazonアソシエイト等）を利用する場合があります。これらのサービスでは、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。</p>

              <h3 className="font-bold mt-4">3. アクセス解析について</h3>
              <p>本アプリでは、サービス向上のためにアクセス解析ツールを使用する場合があります。これらのツールでは、トラフィックデータの収集のためにCookieを使用しています。</p>

              <h3 className="font-bold mt-4">4. 外部リンクについて</h3>
              <p>本アプリからAmazon等の外部サイトへリンクする場合があります。リンク先のサイトにおける個人情報の取り扱いについては、各サイトのプライバシーポリシーをご確認ください。</p>

              <h3 className="font-bold mt-4">5. お問い合わせ</h3>
              <p>本ポリシーに関するお問い合わせは、アプリ内のお問い合わせ機能よりご連絡ください。</p>

              <p className="text-gray-500 mt-4">制定日：2025年1月16日</p>
            </div>
          </div>
        </div>
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
      <InstallPrompt />
    </div>
  )
}

export default App