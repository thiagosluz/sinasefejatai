import React from 'react'

export type AlignVariant = 'left' | 'center' | 'right'

export interface TableProps {
  children: React.ReactNode
  className?: string
}

export interface TableHeadProps extends TableProps {
  align?: AlignVariant
}

export interface TableCellProps extends TableProps {
  align?: AlignVariant
}

export function Table({ children, className = '' }: TableProps) {
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

export function TableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-brand-border/40 border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  )
}

export function TableRow({ children, className = '' }: TableProps) {
  return (
    <tr className={`hover:bg-brand-cream/40 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '', align = 'left' }: TableHeadProps) {
  const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  return (
    <th className={`px-6 py-4 border-r border-zinc-350 last:border-r-0 ${alignment} ${className}`}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  return (
    <td className={`px-6 py-4 border-r border-brand-border last:border-r-0 ${alignment} ${className}`}>
      {children}
    </td>
  )
}

export function TableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={`divide-y divide-brand-border ${className}`}>
      {children}
    </tbody>
  )
}
