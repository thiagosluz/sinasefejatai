'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { FiliacaoFormData, FiliacaoSchema } from '@/schemas/filiacao-schema'

import { solicitarFiliacao } from './actions'

export function FiliacaoForm() {
  const [erro, setErro] = useState<string | null>(null)
  const [renderTime] = useState(() => Date.now().toString())

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FiliacaoFormData>({
    resolver: zodResolver(FiliacaoSchema),
  })

  const onSubmit = async (data: FiliacaoFormData) => {
    setErro(null)
    const res = await solicitarFiliacao(data)

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="hidden" aria-hidden="true">
          <input type="text" {...register('website')} tabIndex={-1} autoComplete="off" />
          <input type="hidden" {...register('timestamp')} value={renderTime} />
        </div>
        {/* Nome + SIAPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-brand-ink mb-1.5">
              Nome Completo <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="nome"
              {...register('nome')}
              disabled={isSubmitting}
              placeholder="Seu nome completo"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.nome ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.nome && <p className="mt-1 text-xs text-brand-tinto">{errors.nome.message}</p>}
          </div>
          <div>
            <label htmlFor="siape" className="block text-sm font-medium text-brand-ink mb-1.5">
              Matrícula SIAPE <span className="text-brand-tinto">*</span>
            </label>
            <input
              id="siape"
              {...register('siape')}
              disabled={isSubmitting}
              placeholder="Número SIAPE"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.siape ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.siape && <p className="mt-1 text-xs text-brand-tinto">{errors.siape.message}</p>}
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
              type="email"
              {...register('email')}
              disabled={isSubmitting}
              placeholder="seu@email.gov.br"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.email ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-brand-tinto">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-brand-ink mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              id="telefone"
              type="tel"
              {...register('telefone')}
              disabled={isSubmitting}
              placeholder="(64) 99999-9999"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.telefone ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.telefone && <p className="mt-1 text-xs text-brand-tinto">{errors.telefone.message}</p>}
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
              {...register('unidade_lotacao')}
              disabled={isSubmitting}
              placeholder="Ex: Departamento de TI"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.unidade_lotacao ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.unidade_lotacao && <p className="mt-1 text-xs text-brand-tinto">{errors.unidade_lotacao.message}</p>}
          </div>
          <div>
            <label htmlFor="campus" className="block text-sm font-medium text-brand-ink mb-1.5">
              Campus
            </label>
            <input
              id="campus"
              {...register('campus')}
              disabled={isSubmitting}
              placeholder="Ex: IFG Jataí"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream disabled:opacity-50 ${errors.campus ? 'border-brand-tinto' : 'border-brand-border'}`}
            />
            {errors.campus && <p className="mt-1 text-xs text-brand-tinto">{errors.campus.message}</p>}
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
                <label key={cat} className={`flex items-center gap-3 cursor-pointer group ${isSubmitting ? 'opacity-50' : ''}`}>
                  <input
                    type="radio"
                    value={cat}
                    {...register('categoria')}
                    disabled={isSubmitting}
                    className="w-4 h-4 accent-brand-tinto"
                  />
                  <span className="text-sm text-zinc-700 group-hover:text-brand-ink transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
            {errors.categoria && <p className="mt-1 text-xs text-brand-tinto">{errors.categoria.message}</p>}
          </div>
          <div>
            <p className="block text-sm font-medium text-brand-ink mb-3">
              Situação <span className="text-brand-tinto">*</span>
            </p>
            <div className="flex flex-col gap-2">
              {['Ativo', 'Aposentado'].map((sit) => (
                <label key={sit} className={`flex items-center gap-3 cursor-pointer group ${isSubmitting ? 'opacity-50' : ''}`}>
                  <input
                    type="radio"
                    value={sit}
                    {...register('situacao')}
                    disabled={isSubmitting}
                    className="w-4 h-4 accent-brand-tinto"
                  />
                  <span className="text-sm text-zinc-700 group-hover:text-brand-ink transition-colors">
                    {sit}
                  </span>
                </label>
              ))}
            </div>
            {errors.situacao && <p className="mt-1 text-xs text-brand-tinto">{errors.situacao.message}</p>}
          </div>
        </div>

        <div className="pt-2">
          <button
            id="submit-filiacao"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-tinto text-white font-bold py-3.5 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Pedido de Filiação'}
          </button>
          <p className="text-xs text-zinc-400 text-center mt-3">
            Seus dados serão analisados pela diretoria. Você receberá uma confirmação por e-mail.
          </p>
        </div>
      </form>
    </>
  )
}
