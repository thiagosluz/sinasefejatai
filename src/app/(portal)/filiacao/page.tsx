import { Check, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { EMAIL_SINDICATO } from '@/lib/constants'

import { FiliacaoForm } from './filiacao-form'

const beneficios = [
  'Representação jurídica em questões trabalhistas',
  'Participação nas assembleias deliberativas',
  'Acesso a convênios e parcerias do sindicato',
  'Informações sobre concursos e promoções',
  'Defesa da carreira e condições de trabalho',
  'Solidariedade e suporte à categoria',
]

interface Props {
  searchParams: Promise<{ sucesso?: string; error?: string }>
}

export default async function FiliacaoPage({ searchParams }: Props) {
  const params = await searchParams
  const sucesso = params.sucesso === '1'

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 45%, #1c1917 100%)' }}
      >
        {/* Padrão de fundo sutil */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 50%)`,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Seja parte do movimento</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Solicitação de Filiação</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Junte-se ao SINASEFE JATAÍ e faça parte da luta pelos direitos dos servidores federais da educação.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {sucesso ? (
            /* Sucesso */
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-brand-ink font-serif mb-4">Pedido Enviado!</h2>
              <p className="text-zinc-600 leading-relaxed mb-2">
                Seu pedido de filiação foi recebido com sucesso. A diretoria do SINASEFE JATAÍ entrará em contato para confirmar sua filiação.
              </p>
              <p className="text-zinc-500 text-sm mb-8">
                Guarde o seu e-mail informado para receber a confirmação.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-brand-tinto text-white font-semibold px-7 py-3 rounded-full hover:bg-brand-tinto-light transition-all"
              >
                Voltar ao início
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Painel esquerdo — Benefícios */}
              <div
                className="lg:col-span-2 rounded-2xl p-8 text-white"
                style={{ background: 'linear-gradient(160deg, #7f1d1d 0%, #450a0a 100%)' }}
              >
                <h2 className="text-2xl font-bold font-serif mb-2">Por que se filiar?</h2>
                <p className="text-white/70 text-sm mb-8">
                  Você garante representação e direitos como servidor.
                </p>
                <ul className="space-y-4">
                  {beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-white" />
                      </div>
                      <span className="text-white/90 text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-white/60 text-xs">
                    Dúvidas? Entre em contato:{' '}
                    <a href={`mailto:${EMAIL_SINDICATO}`} className="text-brand-tinto hover:text-brand-tinto-light hover:underline font-medium">
                      {EMAIL_SINDICATO}
                    </a>
                  </p>
                </div>
              </div>

              {/* Painel direito — Formulário */}
              <div className="lg:col-span-3 bg-white rounded-2xl p-8 border border-brand-border-muted shadow-sm">
                <h2 className="text-xl font-bold text-brand-ink font-serif mb-1">Seus dados</h2>
                <p className="text-zinc-500 text-sm mb-6">
                  Campos marcados com <span className="text-brand-tinto">*</span> são obrigatórios.
                </p>

                <FiliacaoForm />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
