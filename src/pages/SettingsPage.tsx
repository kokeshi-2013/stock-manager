import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/common/Icon'
import { SyncSettings } from '../components/settings/SyncSettings'
import { VoiceShortcutGuide } from '../components/settings/VoiceShortcutGuide'

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate('/app')}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-lg"
        >
          <Icon name="arrow_back" size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">設定</h1>
      </header>

      {/* 設定項目 */}
      <div className="p-4 space-y-4">
        <SyncSettings />
        <VoiceShortcutGuide />
      </div>
    </div>
  )
}
