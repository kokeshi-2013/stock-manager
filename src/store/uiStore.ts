import { create } from 'zustand'
import type { TabType } from '../types/item'
import { DEFAULT_TAB } from '../constants/tabs'

interface SnackbarState {
  message: string
  action?: () => void
}

interface UIStore {
  // タブ
  activeTab: TabType
  setActiveTab: (tab: TabType) => void

  // 検索
  searchQuery: string
  setSearchQuery: (query: string) => void

  // フィルター
  filterPurchasePlace: string | null
  setFilterPurchasePlace: (place: string | null) => void

  // スナックバー
  snackbar: SnackbarState | null
  showSnackbar: (message: string, action?: () => void) => void
  hideSnackbar: () => void

  // ドラッグ
  draggingItemId: string | null
  setDraggingItemId: (id: string | null) => void

  // バーコードスキャナー
  isScannerOpen: boolean
  setIsScannerOpen: (open: boolean) => void
  isBarcodeSearching: boolean
  setIsBarcodeSearching: (searching: boolean) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  activeTab: DEFAULT_TAB,
  setActiveTab: (tab) => set({ activeTab: tab }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  filterPurchasePlace: null,
  setFilterPurchasePlace: (place) => set({ filterPurchasePlace: place }),

  snackbar: null,
  showSnackbar: (message, action) => set({ snackbar: { message, action } }),
  hideSnackbar: () => set({ snackbar: null }),

  draggingItemId: null,
  setDraggingItemId: (id) => set({ draggingItemId: id }),

  isScannerOpen: false,
  setIsScannerOpen: (open) => set({ isScannerOpen: open }),
  isBarcodeSearching: false,
  setIsBarcodeSearching: (searching) => set({ isBarcodeSearching: searching }),
}))
