import type { ConsumptionRate, TabType } from '../types'

export interface RateConfig {
  type: ConsumptionRate
  label: string
  description: string
  cycleDays: number
  initialTab: TabType
}

export const CONSUMPTION_RATES: RateConfig[] = [
  {
    type: 'FREQUENT',
    label: 'よく使う',
    description: '約1ヶ月で消費',
    cycleDays: 30,
    initialTab: 'FUTURE',
  },
  {
    type: 'OCCASIONAL',
    label: 'たまに使う',
    description: '約3ヶ月で消費',
    cycleDays: 90,
    initialTab: 'STORAGE',
  },
  {
    type: 'STOCKPILE',
    label: 'あると安心',
    description: '4ヶ月以上で消費',
    cycleDays: 120,
    initialTab: 'STORAGE',
  },
]

export function getCycleDays(rate: ConsumptionRate): number {
  const config = CONSUMPTION_RATES.find((r) => r.type === rate)
  return config?.cycleDays ?? 90
}

export function getInitialTab(rate: ConsumptionRate): TabType {
  const config = CONSUMPTION_RATES.find((r) => r.type === rate)
  return config?.initialTab ?? 'STORAGE'
}
