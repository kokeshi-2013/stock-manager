type IconName =
  | 'arrow_back'
  | 'star'
  | 'delete'
  | 'add'
  | 'check'
  | 'drag_indicator'
  | 'search'
  | 'close'
  | 'photo_camera'
  | 'notifications'
  | 'sync'
  | 'bolt'
  | 'verified_user'

interface IconProps {
  name: IconName
  size?: number
  className?: string
  filled?: boolean
}

export function Icon({ name, size = 24, className = '', filled = false }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
      }}
    >
      {name}
    </span>
  )
}
