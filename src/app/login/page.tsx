'use client'

import { useState } from 'react'
import { login } from './actions'
import { toast } from 'sonner'

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4 font-sans text-brand-ink selection:bg-brand-tinto selection:text-white">
      {/* Container: Estilo Ficha Administrativa de Época */}
      <div className="w-full max-w-md bg-[#faf8f5] border-4 border-double border-brand-tinto p-1.5 shadow-2xl">
        <div className="border border-zinc-300 p-8 space-y-6">
          
          {/* Cabeçalho Editorial */}
          <div className="text-center space-y-2 pb-6 border-b border-dashed border-zinc-300">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Seção Sindical Jataí</div>
            <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">SINASEFE</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mt-1">
              Carteira de Acesso Administrativo
            </p>
          </div>

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
              {loading ? 'Autenticando...' : 'Autenticar Carteira \u2192'}
            </button>
          </form>

          {/* Rodapé Arquivístico */}
          <div className="text-[10px] text-center text-zinc-450 uppercase tracking-widest pt-4 border-t border-dashed border-zinc-300">
            Registro Oficial • CNPJ 03.658.820/0001-18
          </div>
        </div>
      </div>
    </div>
  )
}
