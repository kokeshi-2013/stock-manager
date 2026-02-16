import type { Item, TabType } from '../types'
import { getCycleDays } from '../constants/consumptionRate'

/**
 * nextRemindDateを計算する
 * - チェック履歴がなければ、作成日 + 消費サイクル日数
 * - チェック履歴があれば、最終チェック日 + 消費サイクル日数
 */
export function calculateNextRemindDate(item: Pick<Item, 'consumptionRate' | 'checkHistory' | 'createdAt'>): string {
  const cycleDays = getCycleDays(item.consumptionRate)
  const baseDate = item.checkHistory.length > 0
    ? new Date(item.checkHistory[item.checkHistory.length - 1].checkedAt)
    : new Date(item.createdAt)

  const next = new Date(baseDate)
  next.setDate(next.getDate() + cycleDays)
  return next.toISOString()
}

/**
 * チェック履歴から実際の消費サイクルを学習する
 * 2回以上のチェックがあれば、チェック間隔の平均値を返す（日数）
 * 1回以下なら null（学習データ不足）
 */
export function learnCycleDays(checkHistory: Item['checkHistory']): number | null {
  if (checkHistory.length < 2) return null

  let totalDays = 0
  for (let i = 1; i < checkHistory.length; i++) {
    const prev = new Date(checkHistory[i - 1].checkedAt).getTime()
    const curr = new Date(checkHistory[i].checkedAt).getTime()
    totalDays += (curr - prev) / (1000 * 60 * 60 * 24)
  }

  return Math.round(totalDays / (checkHistory.length - 1))
}

/**
 * nextRemindDateまでの残り日数に基づいてタブを決定する
 * ★とゴミ箱は別途判定するので、ここでは SOON/FUTURE/STORAGE のみ返す
 */
export function calculateTab(item: Pick<Item, 'isStarred' | 'trashedAt' | 'nextRemindDate'>): TabType {
  if (item.isStarred) return 'STAR'
  if (item.trashedAt) return 'TRASH'

  const now = new Date().getTime()
  const remind = new Date(item.nextRemindDate).getTime()
  const daysUntil = (remind - now) / (1000 * 60 * 60 * 24)

  if (daysUntil <= 30) return 'SOON'
  if (daysUntil <= 90) return 'FUTURE'
  return 'STORAGE'
}

/**
 * 全アイテムのcurrentTabを再計算する
 */
export function recalculateTabs(items: Item[]): Item[] {
  return items.map((item) => ({
    ...item,
    currentTab: calculateTab(item),
  }))
}
