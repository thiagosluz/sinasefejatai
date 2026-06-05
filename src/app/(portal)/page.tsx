import { ArrowRight, CalendarDays, ChevronRight, FileText, MapPin, Shield, Users } from 'lucide-react'
import Link from 'next/link'

import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

async function getAssembleiasRecentes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('assembleias')
    .select('id, numero, tipo, data_realizacao, local, status, pautas')
    .neq('status', 'Rascunho')
    .order('data_realizacao', { ascending: false })
    .limit(3)
  return data ?? []
}

async function getConfiguracoes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracoes')
    .select('titulo, secao_sindical, endereco, cep, fundacao')
    .eq('id', 1)
    .single()
  return data
}

function formatDate(dateStr: string) {
  return formatarDataPtBR(dateStr, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const statusStyles: Record<string, string> = {
  Agendada: 'bg-blue-100 text-blue-800',
  Realizada: 'bg-green-100 text-green-800',
  Cancelada: 'bg-zinc-100 text-zinc-600',
}

export default async function PortalHomePage() {
  const [assembleias, config] = await Promise.all([
    getAssembleiasRecentes(),
    getConfiguracoes(),
  ])

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
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

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-olive-light animate-pulse" />
              <span className="text-white/90 text-xs font-medium tracking-wide uppercase">
                Sindicato ativo desde {config?.fundacao?.replace('FUNDADO EM ', '') ?? '2005'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-serif leading-tight mb-6">
              SINASEFE <span className="text-red-300">Seção Sindical Jataí</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
              Representando e defendendo os servidores federais da educação básica, profissional e tecnológica do IFG — Câmpus Jataí.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/filiacao"
                id="hero-cta-filiacao"
                className="inline-flex items-center gap-2 bg-white text-brand-tinto font-bold px-7 py-3.5 rounded-full hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
              >
                Faça sua Filiação
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/assembleias"
                id="hero-cta-assembleias"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-full hover:border-white hover:bg-white/10 transition-all text-sm backdrop-blur-sm"
              >
                Ver Assembleias
              </Link>
            </div>
          </div>

          {/* Stats glassmorphism */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              { icon: <Users size={20} />, label: 'Filiados Representados', value: 'IFG Câmpus Jataí' },
              { icon: <Shield size={20} />, label: 'Anos de Luta Sindical', value: '20+ anos' },
              { icon: <FileText size={20} />, label: 'Filiado à', value: 'CEA' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Missão ── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-3">Nossa missão</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-ink font-serif leading-tight mb-6">
                Transparência e representação para todos os servidores
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                O SINASEFE Jataí é a entidade sindical que representa os servidores técnicos-administrativos e docentes do Instituto Federal de Goiás — Campus Jataí. Atuamos na defesa dos direitos trabalhistas, na valorização da carreira e na promoção de melhores condições de trabalho.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Acreditamos que a transparência é a base de uma gestão sindical sólida. Por isso, todas as assembleias, atas e prestações de contas são disponibilizadas publicamente neste portal.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🗳️', title: 'Democracia Sindical', desc: 'Decisões tomadas coletivamente em assembleias com todos os filiados.' },
                { icon: '📋', title: 'Transparência Total', desc: 'Atas, editais e prestações de contas publicadas e acessíveis.' },
                { icon: '⚖️', title: 'Defesa de Direitos', desc: 'Representação jurídica e negociação com a administração pública.' },
                { icon: '🤝', title: 'Solidariedade', desc: 'Apoio mútuo entre servidores ativos, aposentados e em estágio probatório.' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-5 border border-brand-border-muted hover:border-brand-tinto/30 hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-brand-ink text-sm mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Últimas Assembleias ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-2">Transparência</p>
              <h2 className="text-3xl font-bold text-brand-ink font-serif">Últimas Assembleias</h2>
            </div>
            <Link
              href="/assembleias"
              id="home-ver-todas-assembleias"
              className="hidden sm:inline-flex items-center gap-1.5 text-brand-tinto font-semibold text-sm hover:gap-2.5 transition-all"
            >
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>

          {assembleias.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">Nenhuma assembleia publicada até o momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assembleias.map((a) => (
                <article
                  key={a.id}
                  className="group bg-brand-card border border-brand-border-muted rounded-2xl p-6 hover:shadow-lg hover:border-brand-tinto/30 transition-all flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[a.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {a.status}
                    </span>
                    {a.numero && (
                      <span className="text-xs text-zinc-400 font-mono">Nº {a.numero}</span>
                    )}
                  </div>

                  <h3 className="font-bold text-brand-ink font-serif mb-2">
                    Assembleia {a.tipo}
                  </h3>

                  <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                    <CalendarDays size={14} className="text-brand-tinto flex-shrink-0" />
                    <span>{formatDate(a.data_realizacao)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-zinc-500 text-sm mb-4">
                    <MapPin size={14} className="text-brand-tinto flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{a.local}</span>
                  </div>

                  {a.pautas && a.pautas.length > 0 && (
                    <ul className="space-y-1">
                      {a.pautas.slice(0, 2).map((pauta: string, i: number) => (
                        <li key={i} className="text-xs text-zinc-500 flex items-start gap-1.5">
                          <span className="mt-1 w-1 h-1 rounded-full bg-brand-tinto flex-shrink-0" />
                          <span className="line-clamp-1">{pauta}</span>
                        </li>
                      ))}
                      {a.pautas.length > 2 && (
                        <li className="text-xs text-zinc-400 pl-3">
                          +{a.pautas.length - 2} item(s)...
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-auto pt-6 flex justify-end">
                    <Link
                      href={`/assembleias/${a.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-tinto text-white text-xs font-semibold rounded-full hover:bg-brand-tinto-light transition-all hover:shadow-md"
                    >
                      Ver Detalhes
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/assembleias"
              className="inline-flex items-center gap-1.5 text-brand-tinto font-semibold text-sm"
            >
              Ver todas as assembleias <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Filiação ── */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-serif mb-4">
            Faça parte do SINASEFE Jataí
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            A filiação é gratuita. Juntos somos mais fortes na defesa dos nossos direitos como servidores federais.
          </p>
          <Link
            href="/filiacao"
            id="cta-filiacao-banner"
            className="inline-flex items-center gap-2 bg-white text-brand-tinto font-bold px-8 py-4 rounded-full hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-base"
          >
            Solicitar Filiação
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Contato Rápido ── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-2">Onde estamos</p>
            <h2 className="text-3xl font-bold text-brand-ink font-serif">Entre em Contato</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-brand-border-muted text-center hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <MapPin size={22} className="text-brand-tinto" />
              </div>
              <h3 className="font-bold text-brand-ink text-sm mb-1">Endereço</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                {config?.endereco ?? 'Rua Riachuelo, 2090'}<br />
                {config?.cep ?? 'CEP: 75804-020'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-brand-border-muted text-center hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-brand-tinto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-ink text-sm mb-1">E-mail</h3>
              <a
                href="mailto:sinasefe.jatai@gmail.com"
                className="text-brand-tinto text-xs hover:underline"
              >
                sinasefe.jatai@gmail.com
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-brand-border-muted text-center hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-brand-tinto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-ink text-sm mb-1">Atendimento</h3>
              <p className="text-zinc-500 text-xs">Segunda a Sexta<br />08h às 17h</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/contato"
              id="home-cta-contato"
              className="inline-flex items-center gap-2 border-2 border-brand-tinto text-brand-tinto font-semibold px-7 py-3 rounded-full hover:bg-brand-tinto hover:text-white transition-all text-sm"
            >
              Enviar Mensagem
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
