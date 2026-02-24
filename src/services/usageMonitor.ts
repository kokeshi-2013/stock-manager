import { doc, setDoc } from 'firebase/firestore'
import { getDB } from '../lib/firebase'
import { useSyncStore } from '../store/syncStore'

/**
 * Firebase使用量を監視して、しきい値を超えたら通知用ドキュメントに記録する
 * ユーザーには見えない。開発者がSlack/メールで確認する用途。
 */

// Firebase無料枠
const DAILY_READ_LIMIT = 50_000
const DAILY_WRITE_LIMIT = 20_000

// アラートしきい値
const THRESHOLDS = [
  { percent: 50, label: '50%' },
  { percent: 80, label: '80%' },
  { percent: 90, label: '90%' },
  { percent: 95, label: '95%' },
]

interface DailyUsage {
  date: string
  reads: number
  writes: number
  alertsSent: number[] // 送信済みのしきい値（%）
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0] // "2026-02-19"
}

function loadLocalUsage(): DailyUsage {
  try {
    const stored = localStorage.getItem('kaitas-usage')
    if (stored) {
      const usage = JSON.parse(stored) as DailyUsage
      // 日付が変わっていたらリセット
      if (usage.date === getTodayKey()) {
        return usage
      }
    }
  } catch {
    // パース失敗時は新規作成
  }
  return { date: getTodayKey(), reads: 0, writes: 0, alertsSent: [] }
}

function saveLocalUsage(usage: DailyUsage): void {
  localStorage.setItem('kaitas-usage', JSON.stringify(usage))
}

/**
 * Firestoreの _usage ドキュメントに使用量を記録する（Cronジョブ用）
 */
async function syncUsageToFirestore(usage: DailyUsage): Promise<void> {
  const db = getDB()
  if (!db) return

  try {
    await setDoc(doc(db, '_usage', usage.date), {
      reads: usage.reads,
      writes: usage.writes,
      alertsSent: usage.alertsSent,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  } catch (error) {
    // 使用量記録のエラーは無視（本体のエラーではないので）
    console.warn('[UsageMonitor] Firestore記録エラー:', error)
  }
}

/**
 * しきい値チェック: 超えたらFirestoreに記録 & 節約モード切り替え
 */
function checkThresholds(usage: DailyUsage): void {
  const readPercent = (usage.reads / DAILY_READ_LIMIT) * 100
  const writePercent = (usage.writes / DAILY_WRITE_LIMIT) * 100
  const maxPercent = Math.max(readPercent, writePercent)

  for (const threshold of THRESHOLDS) {
    if (maxPercent >= threshold.percent && !usage.alertsSent.includes(threshold.percent)) {
      usage.alertsSent.push(threshold.percent)
      console.warn(`[UsageMonitor] 使用量 ${threshold.label} 到達 (reads: ${usage.reads}, writes: ${usage.writes})`)

      // Firestoreに記録（Cronジョブが読んでSlackに通知）
      syncUsageToFirestore(usage)
    }
  }

  // 95%以上で節約モード
  if (maxPercent >= 95) {
    useSyncStore.getState().setSavingMode(true)
    console.warn('[UsageMonitor] 節約モード発動')
  } else {
    // 日付リセット後に節約モード解除
    if (useSyncStore.getState().savingMode) {
      useSyncStore.getState().setSavingMode(false)
    }
  }
}

/**
 * 使用量モニター（シングルトン）
 */
export const usageMonitor = {
  /**
   * 読み取りカウント（1ドキュメントにつき1回）
   */
  countRead(count: number = 1): void {
    const usage = loadLocalUsage()
    usage.reads += count
    saveLocalUsage(usage)
    checkThresholds(usage)
  },

  /**
   * 書き込みカウント
   */
  countWrite(count: number = 1): void {
    const usage = loadLocalUsage()
    usage.writes += count
    saveLocalUsage(usage)
    checkThresholds(usage)
  },

  /**
   * 現在の使用量を取得
   */
  getUsage(): DailyUsage {
    return loadLocalUsage()
  },

  /**
   * 使用量をFirestoreに同期（定期的に呼ぶ）
   */
  async flush(): Promise<void> {
    const usage = loadLocalUsage()
    await syncUsageToFirestore(usage)
  },

  /**
   * 節約モード中かどうか
   */
  isSavingMode(): boolean {
    return useSyncStore.getState().savingMode
  },
}
