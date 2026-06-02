'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { ContatoFormData, ContatoSchema } from '@/schemas/contato-schema'

import { enviarMensagem } from './actions'

export function ContatoForm() {
  const [erro, setErro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContatoFormData>({
    resolver: zodResolver(ContatoSchema),
  })

  const onSubmit = async (data: ContatoFormData) => {
    setErro(null)
    const res = await enviarMensagem(data)

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-brand-ink mb-1.5">
              Nome <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="nome"
              {...register('nome')}
              disabled={isSubmitting}
              placeholder="Seu nome"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.nome ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.nome && <p className="mt-1 text-xs text-brand-tinto">{errors.nome.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-ink mb-1.5">
              E-mail <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              disabled={isSubmitting}
              placeholder="seu@email.com"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.email ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-brand-tinto">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="assunto" className="block text-sm font-medium text-brand-ink mb-1.5">
            Assunto
          </label>
          <input
            id="assunto"
            {...register('assunto')}
            disabled={isSubmitting}
            placeholder="Qual é o assunto?"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.assunto ? 'border-brand-tinto' : 'border-brand-border'}`}
          />
          {errors.assunto && <p className="mt-1 text-xs text-brand-tinto">{errors.assunto.message}</p>}
        </div>

        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-brand-ink mb-1.5">
            Mensagem <span className="text-brand-tinto">*</span>
          </label>
          <textarea
            id="mensagem"
            {...register('mensagem')}
            rows={5}
            disabled={isSubmitting}
            placeholder="Descreva sua dúvida ou demanda..."
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream resize-none disabled:opacity-50 ${errors.mensagem ? 'border-brand-tinto' : 'border-brand-border'}`}
          />
          {errors.mensagem && <p className="mt-1 text-xs text-brand-tinto">{errors.mensagem.message}</p>}
        </div>

        <button
          id="submit-contato"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-tinto text-white font-bold py-3.5 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </form>
    </>
  )
}
