import React from 'react'

interface AdminPageWrapperProps {
  children: React.ReactNode
}

export default function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {children}
    </div>
  )
}
