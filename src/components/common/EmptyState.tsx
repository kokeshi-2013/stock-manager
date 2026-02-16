interface EmptyStateProps {
  message: string
  subMessage?: string
}

export function EmptyState({ message, subMessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <p className="text-gray-500 text-base">{message}</p>
      {subMessage && <p className="text-gray-400 text-sm mt-2">{subMessage}</p>}
    </div>
  )
}
