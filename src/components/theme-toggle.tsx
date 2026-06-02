'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevenir erro de hidratação
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder do mesmo tamanho
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 border-2 border-brand-ink bg-brand-cream text-brand-ink hover:bg-brand-ink hover:text-brand-cream transition-all shadow-[2px_2px_0px_var(--color-brand-ink)] hover:shadow-[0px_0px_0px_var(--color-brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px]"
      aria-label="Alternar tema"
      title="Alternar Modo Noturno"
    >
      {theme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
    </button>
  )
}
