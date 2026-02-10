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