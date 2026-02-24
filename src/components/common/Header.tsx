import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { SyncStatusBadge } from './SyncStatusBadge'

export function Header() {
  const navigate = useNavigate()

  return (
    <header className="bg-white px-4 pt-4 pb-2 flex items-center">
      <img
        src="/logohorizontal.svg"
        alt="カイタス"
        className="h-8 cursor-pointer"
        onClick={() => navigate('/app')}
      />
      <div className="ml-auto flex items-center gap-2">
        <SyncStatusBadge />
        <button
          onClick={() => navigate('/app/settings')}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          <Icon name="settings" size={22} />
        </button>
      </div>
    </header>
  )
}
