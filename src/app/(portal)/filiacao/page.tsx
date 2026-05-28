import Link from 'next/link'
import { CheckCircle2, AlertCircle, Check } from 'lucide-react'
import { solicitarFiliacao } from './actions'

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
  const erro = params.error

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Seja parte do movimento</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Solicitação de Filiação</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Junte-se ao SINASEFE Jataí e faça parte da luta pelos direitos dos servidores federais da educação.
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
                Seu pedido de filiação foi recebido com sucesso. A diretoria do SINASEFE Jataí entrará em contato para confirmar sua filiação.
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
                  A filiação é gratuita e você garante representação e direitos como servidor.
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
                    <a href="mailto:sinasefe.jatai@gmail.com" className="text-white/90 hover:text-white underline">
                      sinasefe.jatai@gmail.com
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

                {/* Erro */}
                {erro && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <AlertCircle size={18} className="text-brand-tinto flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{erro}</p>
                  </div>
                )}

                <form action={solicitarFiliacao} className="space-y-5">
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
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="Número SIAPE"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="seu@email.gov.br"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="(64) 99999-9999"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="Ex: Departamento de TI"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="Ex: IFG Jataí"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                          <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="categoria"
                              value={cat}
                              required
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
                          <label key={sit} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="situacao"
                              value={sit}
                              required
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
                      className="w-full bg-brand-tinto text-white font-bold py-3.5 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm"
                    >
                      Enviar Pedido de Filiação
                    </button>
                    <p className="text-xs text-zinc-400 text-center mt-3">
                      Seus dados serão analisados pela diretoria. Você receberá uma confirmação por e-mail.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
