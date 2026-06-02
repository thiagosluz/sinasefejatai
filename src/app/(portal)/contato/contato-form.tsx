'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { enviarMensagem } from './actions'

export function ContatoForm() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setErro(null)
    const res = await enviarMensagem(formData)
    setLoading(false)

    // A action faz redirect no sucesso, 
    // mas se falhar nós pegamos aqui:
    if (res?.success) {
      toast.success('Mensagem enviada com sucesso!')
    } else if (res?.error) {
      setErro(res.error)
      toast.error(res.error)
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold text-brand-ink font-serif mb-1">Envie uma mensagem</h2>
      <p className="text-zinc-500 text-sm mb-6">
        Campos com <span className="text-brand-tinto">*</span> são obrigatórios.
      </p>

      {erro && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle size={18} className="text-brand-tinto flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-brand-ink mb-1.5">
              Nome <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              disabled={loading}
              placeholder="Seu nome"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
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
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="assunto" className="block text-sm font-medium text-brand-ink mb-1.5">
            Assunto
          </label>
          <input
            id="assunto"
            name="assunto"
            type="text"
            disabled={loading}
            placeholder="Qual é o assunto?"
            className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-brand-ink mb-1.5">
            Mensagem <span className="text-brand-tinto">*</span>
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            required
            rows={5}
            disabled={loading}
            placeholder="Descreva sua dúvida ou demanda..."
            className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream resize-none disabled:opacity-50"
          />
        </div>

        <button
          id="submit-contato"
          type="submit"
          disabled={loading}
          className="w-full bg-brand-tinto text-white font-bold py-3.5 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </form>
    </>
  )
}
