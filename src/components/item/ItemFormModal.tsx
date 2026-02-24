import { useState, useEffect, useMemo } from 'react'
import type { ConsumptionRate } from '../../types/item'
import { useItemStore } from '../../store/itemStore'
import { useUIStore } from '../../store/uiStore'
import { CONSUMPTION_RATES } from '../../constants/consumptionRate'
import { SegmentButton } from '../common/SegmentButton'
import { BarcodeScanner } from '../scanner/BarcodeScanner'
import { searchByBarcode } from '../../services/barcode'
import { getSmartIcon } from '../../utils/smartIcon'
import { Icon } from '../common/Icon'

interface ItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  editItemId?: string | null
}

export function ItemFormModal({ isOpen, onClose, editItemId }: ItemFormModalProps) {
  const items = useItemStore((s) => s.items)
  const addItem = useItemStore((s) => s.addItem)
  const updateItem = useItemStore((s) => s.updateItem)
  const deleteItem = useItemStore((s) => s.deleteItem)
  const toggleStar = useItemStore((s) => s.toggleStar)
  const isBarcodeSearching = useUIStore((s) => s.isBarcodeSearching)
  const setIsBarcodeSearching = useUIStore((s) => s.setIsBarcodeSearching)

  const editItem = editItemId ? items.find((i) => i.id === editItemId) : null
  const isEditMode = !!editItem

  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [barcode, setBarcode] = useState('')
  const [purchasePlace, setPurchasePlace] = useState('')
  const [consumptionRate, setConsumptionRate] = useState<ConsumptionRate>('OCCASIONAL')
  const [memo, setMemo] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  // 購入場所オートコンプリート
  const purchasePlaces = useMemo(() => {
    const places = items.map((i) => i.purchasePlace).filter((p): p is string => !!p)
    return [...new Set(places)]
  }, [items])

  // モーダルが開いた時にフォームを初期化
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name)
        setImageUrl(editItem.imageUrl ?? '')
        setBarcode(editItem.barcode ?? '')
        setPurchasePlace(editItem.purchasePlace ?? '')
        setConsumptionRate(editItem.consumptionRate)
        setMemo(editItem.memo ?? '')
      } else {
        setName('')
        setImageUrl('')
        setBarcode('')
        setPurchasePlace('')
        setConsumptionRate('OCCASIONAL')
        setMemo('')
      }
      setShowScanner(false)
    }
  }, [isOpen, editItem])

  const handleBarcodeScan = async (code: string) => {
    setShowScanner(false)
    setBarcode(code)
    setIsBarcodeSearching(true)

    try {
      const result = await searchByBarcode(code)
      if (result.found) {
        setName(result.name)
        if (result.imageUrl) setImageUrl(result.imageUrl)
      } else {
        setName(`JANコード: ${code}`)
      }
    } catch {
      setName(`JANコード: ${code}`)
    } finally {
      setIsBarcodeSearching(false)
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    if (isEditMode && editItemId) {
      updateItem(editItemId, {
        name: name.trim(),
        imageUrl: imageUrl || null,
        purchasePlace: purchasePlace.trim() || null,
        consumptionRate,
        memo: memo.trim() || null,
      })
    } else {
      addItem({
        name: name.trim(),
        imageUrl: imageUrl || null,
        barcode: barcode || null,
        purchasePlace: purchasePlace.trim() || null,
        consumptionRate,
        memo: memo.trim() || null,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (editItemId) {
      deleteItem(editItemId)
      onClose()
    }
  }

  const segmentOptions = CONSUMPTION_RATES.map((r) => ({
    value: r.type,
    label: r.label,
    description: r.description,
  }))

  if (!isOpen) return null

  // バーコードスキャナー（全画面表示 — モーダルより上に出る）
  if (showScanner) {
    return <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* モーダル本体（下からスライドアップ） */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Icon name="close" size={24} />
            </button>
            <h2 className="font-bold text-lg">
              {isEditMode ? '編集' : '買いたすもの登録'}
            </h2>
          </div>
          {isEditMode && editItemId && editItem && (
            <button
              onClick={() => toggleStar(editItemId)}
              className={editItem.isStarred ? 'text-yellow-400' : 'text-gray-300'}
            >
              <Icon name="star" size={24} filled={editItem.isStarred} />
            </button>
          )}
        </div>

        {/* フォーム（スクロール可能） */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* 商品画像プレビュー */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl overflow-hidden">
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
              list={`purchase-places-${isEditMode ? 'edit' : 'new'}`}
              className="w-full p-3 border rounded-xl text-sm bg-white"
            />
            <datalist id={`purchase-places-${isEditMode ? 'edit' : 'new'}`}>
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

          {/* 登録/保存ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEditMode ? '保存する' : '登録する'}
          </button>

          {/* 削除ボタン（編集時のみ） */}
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="w-full py-3 bg-white border border-error text-error font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-error-light transition-colors"
            >
              <Icon name="delete" size={18} />
              ゴミ箱に移動
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
