'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { login } from './actions'

export function LoginForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await login(formData)
    setLoading(false)

    if (!res?.success && res?.error) {
      toast.error(res.error)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 text-brand-ink">
      {/* Campo E-mail */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="email">
          E-mail de Filiação
        </label>
        <input
          className="bg-brand-card border border-zinc-400 px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors disabled:opacity-50"
          name="email"
          type="email"
          placeholder="coordenacao@sinasefejatai.org.br"
          required
          disabled={loading}
        />
      </div>

      {/* Campo Senha */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="password">
          Senha Geral
        </label>
        <input
          className="bg-brand-card border border-zinc-400 px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors disabled:opacity-50"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      {/* Botão de Autenticação */}
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white font-serif font-bold uppercase tracking-wider text-xs py-3.5 transition-all mt-4 border border-brand-tinto disabled:border-zinc-400 active:scale-98 shadow-[2px_2px_0px_#121214] disabled:shadow-none hover:shadow-[1px_1px_0px_#121214] disabled:hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? 'Autenticando...' : 'Autenticar \u2192'}
      </button>
    </form>
  )
}
