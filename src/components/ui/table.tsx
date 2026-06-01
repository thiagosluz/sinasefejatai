import React from 'react'

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-brand-card border border-brand-border shadow-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
          {children}
        </table>
      </div>
    </div>
  )
}

export function TableHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <thead className={`bg-brand-border/40 border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  )
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`hover:bg-brand-cream/40 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '', align = 'left' }: { children: React.ReactNode, className?: string, align?: 'left'|'center'|'right' }) {
  const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  return (
    <th className={`px-6 py-4 border-r border-zinc-350 last:border-r-0 ${alignment} ${className}`}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', align = 'left' }: { children: React.ReactNode, className?: string, align?: 'left'|'center'|'right' }) {
  const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  return (
    <td className={`px-6 py-4 border-r border-brand-border last:border-r-0 ${alignment} ${className}`}>
      {children}
    </td>
  )
}

export function TableBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tbody className={`divide-y divide-brand-border ${className}`}>
      {children}
    </tbody>
  )
}
