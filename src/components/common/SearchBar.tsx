import { Icon } from './Icon'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'キーワード検索' }: SearchBarProps) {
  return (
    <div className="px-4 py-2 bg-white">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon name="search" size={18} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 pl-10 pr-8 border rounded-lg text-sm bg-gray-50"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
