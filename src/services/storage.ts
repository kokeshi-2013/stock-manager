import type { StockItem } from '../types'

const STORAGE_KEY = 'kaitas-items'

export const loadItems = (): StockItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return []

        const items = JSON.parse(data)

        // 既存データの移行処理
        return items.map((item: any) => {
            // 古い形式 (buyUrl) を新しい形式 (buyUrls) に変換
            if (item.buyUrl && !item.buyUrls) {
                return {
                    ...item,
                    buyUrls: {
                        amazon: item.buyUrl
                    },
                    buyUrl: undefined // 古いフィールドを削除
                }
            }

            // buyUrls がない場合は空オブジェクトを設定
            if (!item.buyUrls) {
                return {
                    ...item,
                    buyUrls: {}
                }
            }

            return item
        })
    } catch {
        return []
    }
}

export const saveItems = (items: StockItem[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}