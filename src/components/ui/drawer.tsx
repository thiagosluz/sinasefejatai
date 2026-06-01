import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end print:hidden">
      <div className="flex-1" onClick={onClose}></div>
      
      <div className="w-full max-w-md bg-brand-cream border-l-2 border-brand-ink p-6 flex flex-col justify-between shadow-2xl relative animate-slide-left overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-brand-ink pb-4 mb-6">
            <h3 className="text-lg font-serif font-bold text-brand-tinto">
              {title}
            </h3>
            <button 
              onClick={onClose}
              type="button"
              className="p-1 hover:bg-brand-card text-brand-ink/50 hover:text-brand-ink transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  )
}
