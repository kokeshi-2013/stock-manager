import type { Item } from '../types/item'

const TRASH_EXPIRY_DAYS = 30

/**
 * ゴミ箱に入れてから30日以上経過したアイテムを除外する
 */
export function cleanupTrash(items: Item[]): Item[] {
  const now = new Date().getTime()
  return items.filter((item) => {
    if (!item.trashedAt) return true
    const trashedTime = new Date(item.trashedAt).getTime()
    const daysSinceTrashed = (now - trashedTime) / (1000 * 60 * 60 * 24)
    return daysSinceTrashed < TRASH_EXPIRY_DAYS
  })
}
