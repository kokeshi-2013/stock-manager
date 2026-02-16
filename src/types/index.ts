// v1 (旧データ形式 — 移行用に残す)
export interface StockItem {
    id: string
    name: string
    count: number
    buyUrls: {
        rakuten?: string
        amazon?: string
        yahoo?: string
    }
    category: string
    imageUrl: string
    createdAt: string
}

// v2 (新データ形式)
export type { Item, ConsumptionRate, TabType, CheckEntry } from './item'