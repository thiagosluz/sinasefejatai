import { createClient } from '@/lib/supabase/server'
import { MapPin, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { enviarMensagem } from './actions'

async function getConfiguracoes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracoes')
    .select('secao_sindical, endereco, cep')
    .eq('id', 1)
    .single()
  return data
}

interface Props {
  searchParams: Promise<{ sucesso?: string; error?: string }>
}

export default async function ContatoPage({ searchParams }: Props) {
  const [params, config] = await Promise.all([searchParams, getConfiguracoes()])
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
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Atendimento</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Fale Conosco</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Entre em contato com a diretoria do SINASEFE Jataí. Estamos aqui para tirar suas dúvidas e ouvir suas demandas.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Informações de contato */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-brand-ink font-serif mb-5">Informações de Contato</h2>

              {[
                {
                  icon: <MapPin size={20} className="text-brand-tinto" />,
                  title: 'Endereço',
                  content: (
                    <>
                      {config?.endereco ?? 'Rua Riachuelo, 2090 — Setor Samuel Graham'}<br />
                      {config?.cep ?? 'CEP: 75804-020'}, Jataí — GO
                    </>
                  ),
                },
                {
                  icon: <Mail size={20} className="text-brand-tinto" />,
                  title: 'E-mail',
                  content: (
                    <a
                      href="mailto:sinasefe.jatai@gmail.com"
                      className="text-brand-tinto hover:underline"
                    >
                      sinasefe.jatai@gmail.com
                    </a>
                  ),
                },
                {
                  icon: <Clock size={20} className="text-brand-tinto" />,
                  title: 'Horário de Atendimento',
                  content: 'Segunda a Sexta-feira, das 08h às 17h',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-5 border border-brand-border-muted flex items-start gap-4 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink text-sm mb-0.5">{item.title}</p>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulário */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-8 border border-brand-border-muted shadow-sm">
              {sucesso ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-ink font-serif mb-2">Mensagem Enviada!</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    Recebemos sua mensagem. A diretoria do SINASEFE Jataí entrará em contato em breve.
                  </p>
                  <a
                    href="/contato"
                    className="inline-flex items-center gap-2 border border-brand-tinto text-brand-tinto font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-brand-tinto hover:text-white transition-all"
                  >
                    Enviar outra mensagem
                  </a>
                </div>
              ) : (
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

                  <form action={enviarMensagem} className="space-y-5">
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
                          placeholder="Seu nome"
                          className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                          placeholder="seu@email.com"
                          className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="Qual é o assunto?"
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream"
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
                        placeholder="Descreva sua dúvida ou demanda..."
                        className="w-full px-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto transition-all bg-brand-cream resize-none"
                      />
                    </div>

                    <button
                      id="submit-contato"
                      type="submit"
                      className="w-full bg-brand-tinto text-white font-bold py-3.5 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm"
                    >
                      Enviar Mensagem
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
