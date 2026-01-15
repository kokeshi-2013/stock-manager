import type { StockItem } from '../types'

const STORAGE_KEY = 'kaitas-items'

export const loadItems = (): StockItem[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
}

export const saveItems = (items: StockItem[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}