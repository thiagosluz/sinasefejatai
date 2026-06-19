'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { login, verifyLoginMfa } from './actions'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [requiresMfa, setRequiresMfa] = useState(false)

  const handleLoginSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await login(formData)
    setLoading(false)

    if (res?.requiresMfa) {
      setRequiresMfa(true)
      toast.success('Credenciais validadas. Insira seu código de 2 Fatores.')
      return
    }

    if (!res?.success && res?.error) {
      toast.error(res.error)
    }
  }

  const handleMfaSubmit = async (formData: FormData) => {
    const code = formData.get('code') as string
    if (!code || code.length !== 6) {
      toast.error('O código deve conter 6 dígitos.')
      return
    }

    setLoading(true)
    const res = await verifyLoginMfa(code)
    setLoading(false)

    if (!res?.success && res?.error) {
      toast.error(res.error)
    }
  }

  if (requiresMfa) {
    return (
      <form action={handleMfaSubmit} className="flex flex-col gap-4 text-brand-ink animate-in fade-in zoom-in-95">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="code">
            Código de Autenticação (TOTP)
          </label>
          <input
            className="bg-brand-card border border-zinc-400 px-4 py-3 text-lg text-center tracking-[0.5em] font-mono text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors disabled:opacity-50"
            name="code"
            type="text"
            maxLength={6}
            placeholder="000000"
            required
            disabled={loading}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white font-serif font-bold uppercase tracking-wider text-xs py-3.5 transition-all mt-4 border border-brand-tinto disabled:border-zinc-400 active:scale-98 shadow-[2px_2px_0px_#121214] disabled:shadow-none hover:shadow-[1px_1px_0px_#121214] disabled:hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : 'Verificar Código \u2192'}
        </button>

        <button
          type="button"
          onClick={() => setRequiresMfa(false)}
          className="text-xs font-bold text-zinc-500 uppercase tracking-wider hover:text-brand-ink mt-2 underline underline-offset-4 text-center"
        >
          Voltar
        </button>
      </form>
    )
  }

  return (
    <form action={handleLoginSubmit} className="flex flex-col gap-4 text-brand-ink">
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
