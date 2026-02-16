interface SegmentOption<T extends string> {
  value: T
  label: string
  description: string
}

interface SegmentButtonProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentButton<T extends string>({ options, value, onChange }: SegmentButtonProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-xl p-3 text-center border-2 transition-colors ${
              isSelected
                ? 'border-primary bg-primary-light text-primary'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <div className="text-sm font-medium">{option.label}</div>
            <div className="text-xs mt-0.5 opacity-70">{option.description}</div>
          </button>
        )
      })}
    </div>
  )
}
