import React from 'react'

export function EmptyState({ title, message, colSpan }: { title: string, message?: string, colSpan?: number }) {
  const content = (
    <div className="py-12 px-6 text-center text-zinc-550 italic font-serif flex flex-col items-center justify-center">
      <span className="text-brand-ink/50 block mb-2">{title}</span>
      {message && <span className="text-xs text-brand-ink/40">{message}</span>}
    </div>
  )

  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-0">
          {content}
        </td>
      </tr>
    )
  }

  return (
    <div className="w-full bg-brand-card border border-brand-border shadow-xl">
      {content}
    </div>
  )
}
