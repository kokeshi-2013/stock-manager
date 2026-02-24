import { Icon } from './Icon'
import { useSyncStore } from '../../store/syncStore'

/**
 * 同期状態を示す小さなバッジ
 * ヘッダー右側に表示
 */
export function SyncStatusBadge() {
  const mode = useSyncStore((s) => s.mode)
  const status = useSyncStore((s) => s.status)

  // ローカルモードの場合は何も表示しない
  if (mode === 'local') return null

  const statusConfig = {
    connected: { icon: 'cloud_done' as const, color: 'text-green-500', label: '同期中' },
    connecting: { icon: 'sync' as const, color: 'text-yellow-500 animate-spin', label: '接続中' },
    error: { icon: 'cloud_off' as const, color: 'text-red-500', label: 'エラー' },
    saving: { icon: 'sync' as const, color: 'text-blue-500 animate-spin', label: '保存中' },
    disconnected: { icon: 'cloud_off' as const, color: 'text-gray-400', label: '未接続' },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-1" title={config.label}>
      <Icon name={config.icon} size={18} className={config.color} />
    </div>
  )
}
