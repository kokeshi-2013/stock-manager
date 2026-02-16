import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Trash2 } from 'lucide-react'
import type { ConsumptionRate } from '../types/item'
import { useItemStore } from '../store/itemStore'
import { useUIStore } from '../store/uiStore'
import { CONSUMPTION_RATES } from '../constants/consumptionRate'
import { SegmentButton } from '../components/common/SegmentButton'
import { BarcodeScanner } from '../components/scanner/BarcodeScanner'
import { searchByBarcode } from '../services/barcode'
import { getSmartIcon } from '../utils/smartIcon'

export default function EditItemPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const items = useItemStore((s) => s.items)
  const updateItem = useItemStore((s) => s.updateItem)
  const deleteItem = useItemStore((s) => s.deleteItem)
  const toggleStar = useItemStore((s) => s.toggleStar)
  const isBarcodeSearching = useUIStore((s) => s.isBarcodeSearching)
  const setIsBarcodeSearching = useUIStore((s) => s.setIsBarcodeSearching)

  const item = items.find((i) => i.id === id)

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [purchasePlace, setPurchasePlace] = useState('')
  const [consumptionRate, setConsumptionRate] = useState<ConsumptionRate>('OCCASIONAL')
  const [memo, setMemo] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const purchasePlaces = useItemStore((s) => s.getPurchasePlaces())

  useEffect(() => {
    if (item) {
      setName(item.name)
      setImageUrl(item.imageUrl ?? '')
      setPurchasePlace(item.purchasePlace ?? '')
      setConsumptionRate(item.consumptionRate)
      setMemo(item.memo ?? '')
    }
  }, [item])

  if (!item || !id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">アイテムが見つかりません</p>
      </div>
    )
  }

  const handleBarcodeScan = async (code: string) => {
    setShowScanner(false)
    setIsBarcodeSearching(true)
    try {
      const result = await searchByBarcode(code)
      if (result.found) {
        setName(result.name)
        if (result.imageUrl) setImageUrl(result.imageUrl)
      }
    } catch {
      // 無視
    } finally {
      setIsBarcodeSearching(false)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return
    updateItem(id, {
      name: name.trim(),
      imageUrl: imageUrl || null,
      purchasePlace: purchasePlace.trim() || null,
      consumptionRate,
      memo: memo.trim() || null,
    })
    navigate('/app')
  }

  const handleDelete = () => {
    deleteItem(id)
    navigate('/app')
  }

  const segmentOptions = CONSUMPTION_RATES.map((r) => ({
    value: r.type,
    label: r.label,
    description: r.description,
  }))

  if (showScanner) {
    return <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">編集</h1>
        </div>
        <button
          onClick={() => toggleStar(id)}
          className={item.isStarred ? 'text-yellow-400' : 'text-gray-300'}
        >
          <Star size={24} fill={item.isStarred ? 'currentColor' : 'none'} />
        </button>
      </header>

      <div className="p-4 space-y-5">
        {/* 商品画像プレビュー */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>{name ? getSmartIcon(name) : '📦'}</span>
            )}
          </div>
        </div>

        {/* 商品名 + バーコード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商品名</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="商品名を入力"
              className="flex-1 p-3 border rounded-xl text-sm bg-white"
            />
            <button
              onClick={() => setShowScanner(true)}
              className="w-12 h-12 border-2 border-brand-700 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-700">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="16" x2="17" y2="16" />
              </svg>
            </button>
          </div>
          {isBarcodeSearching && (
            <p className="text-xs text-primary mt-1">商品情報を検索中...</p>
          )}
        </div>

        {/* 買う場所 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">買う場所</label>
          <input
            type="text"
            value={purchasePlace}
            onChange={(e) => setPurchasePlace(e.target.value)}
            placeholder="スーパー、ドラッグストアなど"
            list="purchase-places-edit"
            className="w-full p-3 border rounded-xl text-sm bg-white"
          />
          <datalist id="purchase-places-edit">
            {purchasePlaces.map((place) => (
              <option key={place} value={place} />
            ))}
          </datalist>
        </div>

        {/* 購入頻度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">購入頻度</label>
          <SegmentButton
            options={segmentOptions}
            value={consumptionRate}
            onChange={setConsumptionRate}
          />
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ（任意）"
            rows={2}
            className="w-full p-3 border rounded-xl text-sm bg-white resize-none"
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          保存する
        </button>

        {/* 削除ボタン */}
        <button
          onClick={handleDelete}
          className="w-full py-3 bg-white border border-error text-error font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-error-light transition-colors"
        >
          <Trash2 size={18} />
          ゴミ箱に移動
        </button>
      </div>
    </div>
  )
}
