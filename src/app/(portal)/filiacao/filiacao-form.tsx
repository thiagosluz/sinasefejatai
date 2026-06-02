'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { solicitarFiliacao } from './actions'

export function FiliacaoForm() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setErro(null)
    const res = await solicitarFiliacao(formData)
    setLoading(false)

    // Note: If success, the action redirects, so we might not reach here,
    // but just in case it doesn't throw NEXT_REDIRECT:
    if (res?.success) {
      toast.success('Pedido enviado com sucesso!')
    } else if (res?.error) {
      setErro(res.error)
      toast.error(res.error)
    }
  }

  return (
    <>
      {erro && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle size={18} className="text-brand-tinto flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        {/* Nome + SIAPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-brand-ink mb-1.5">
              Nome Completo <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              disabled={loading}
              placeholder="Seu nome completo"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="siape" className="block text-sm font-medium text-brand-ink mb-1.5">
              Matrícula SIAPE <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="siape"
              name="siape"
              type="text"
              required
              disabled={loading}
              placeholder="Número SIAPE"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email + Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-ink mb-1.5">
              E-mail <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={loading}
              placeholder="seu@email.gov.br"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-brand-ink mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              disabled={loading}
              placeholder="(64) 99999-9999"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
        </div>

        {/* Unidade + Campus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="unidade_lotacao" className="block text-sm font-medium text-brand-ink mb-1.5">
              Unidade de Lotação
            </label>
            <input
              id="unidade_lotacao"
              name="unidade_lotacao"
              type="text"
              disabled={loading}
              placeholder="Ex: Departamento de TI"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="campus" className="block text-sm font-medium text-brand-ink mb-1.5">
              Campus
            </label>
            <input
              id="campus"
              name="campus"
              type="text"
              disabled={loading}
              placeholder="Ex: IFG Jataí"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
        </div>

        {/* Categoria + Situação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="block text-sm font-medium text-brand-ink mb-3">
              Categoria <span className="text-brand-tinto">*</span>
            </p>
            <div className="flex flex-col gap-2">
              {['Técnico Administrativo', 'Docente'].map((cat) => (
                <label key={cat} className={`flex items-center gap-3 cursor-pointer group ${loading ? 'opacity-50' : ''}`}>
                  <input
                    type="radio"
                    name="categoria"
                    value={cat}
                    required
                    disabled={loading}
                    className="w-4 h-4 accent-brand-tinto"
                  />
                  <span className="text-sm text-zinc-700 group-hover:text-brand-ink transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium text-brand-ink mb-3">
              Situação <span className="text-brand-tinto">*</span>
            </p>
            <div className="flex flex-col gap-2">
              {['Ativo', 'Aposentado'].map((sit) => (
                <label key={sit} className={`flex items-center gap-3 cursor-pointer group ${loading ? 'opacity-50' : ''}`}>
                  <input
                    type="radio"
                    name="situacao"
                    value={sit}
                    required
                    disabled={loading}
                    className="w-4 h-4 accent-brand-tinto"
                  />
                  <span className="text-sm text-zinc-700 group-hover:text-brand-ink transition-colors">
                    {sit}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            id="submit-filiacao"
            type="submit"
            disabled={loading}
            className="w-full bg-brand-tinto text-white font-bold py-3.5 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Pedido de Filiação'}
          </button>
          <p className="text-xs text-zinc-400 text-center mt-3">
            Seus dados serão analisados pela diretoria. Você receberá uma confirmação por e-mail.
          </p>
        </div>
      </form>
    </>
  )
}
