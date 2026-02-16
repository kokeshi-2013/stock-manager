import { useNavigate } from 'react-router-dom'

export function Header() {
  const navigate = useNavigate()

  return (
    <header className="bg-white px-4 pt-4 pb-2">
      <img
        src="/logohorizontal.svg"
        alt="カイタス"
        className="h-8 cursor-pointer"
        onClick={() => navigate('/app')}
      />
    </header>
  )
}
