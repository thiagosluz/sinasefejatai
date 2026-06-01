import { createClient } from '@/lib/supabase/server'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { formatarDataPtBR, formatarHora } from '@/lib/date-utils'

async function getAssembleias() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('assembleias')
    .select('id, numero, tipo, data_realizacao, horario_1a_convocacao, local, status, pautas, publico_alvo')
    .neq('status', 'Rascunho')
    .order('data_realizacao', { ascending: false })
  return data ?? []
}

function formatDate(dateStr: string) {
  return formatarDataPtBR(dateStr, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(timeStr: string) {
  return formatarHora(timeStr)
}

const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  Agendada: { label: 'Agendada', classes: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Realizada: { label: 'Realizada', classes: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  Cancelada: { label: 'Cancelada', classes: 'bg-zinc-50 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' },
}

export default async function AssembleiasPublicasPage() {
  const assembleias = await getAssembleias()

  const porAno = assembleias.reduce<Record<string, typeof assembleias>>((acc, a) => {
    const ano = a.data_realizacao.slice(0, 4)
    if (!acc[ano]) acc[ano] = []
    acc[ano].push(a)
    return acc
  }, {})

  const anos = Object.keys(porAno).sort((a, b) => Number(b) - Number(a))

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Transparência</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Assembleias</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Acompanhe as reuniões deliberativas do SINASEFE Jataí. Aqui estão registrados os editais de convocação, pautas e resultados de todas as assembleias realizadas.
          </p>
        </div>
      </section>

      {/* Listagem */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {assembleias.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-brand-ink font-serif mb-2">Nenhuma assembleia publicada</h2>
              <p className="text-zinc-500">As assembleias futuras aparecerão aqui em breve.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {anos.map((ano) => (
                <div key={ano}>
                  {/* Cabeçalho do ano */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-brand-ink font-serif">{ano}</h2>
                    <div className="flex-1 h-px bg-brand-border" />
                    <span className="text-sm text-zinc-400 font-medium">
                      {porAno[ano].length} assembleia{porAno[ano].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cards do ano */}
                  <div className="space-y-4">
                    {porAno[ano].map((a) => {
                      const status = statusConfig[a.status] ?? statusConfig.Agendada
                      return (
                        <article
                          key={a.id}
                          className="bg-white border border-brand-border-muted rounded-2xl p-6 hover:shadow-md hover:border-brand-tinto/20 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            {/* Info principal */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${status.classes}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                  {status.label}
                                </span>
                                {a.tipo && (
                                  <span className="text-xs text-zinc-400 font-medium bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full">
                                    {a.tipo}
                                  </span>
                                )}
                                {a.numero && (
                                  <span className="text-xs text-zinc-400 font-mono">Nº {a.numero}</span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4">
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                  <CalendarDays size={15} className="text-brand-tinto flex-shrink-0" />
                                  <span className="capitalize">{formatDate(a.data_realizacao)}</span>
                                  {a.horario_1a_convocacao && (
                                    <span className="text-zinc-400">às {formatTime(a.horario_1a_convocacao)}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                  <MapPin size={15} className="text-brand-tinto flex-shrink-0" />
                                  <span>{a.local}</span>
                                </div>
                              </div>

                              {/* Pautas */}
                              {a.pautas && a.pautas.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pauta</p>
                                  <ul className="space-y-1">
                                    {a.pautas.map((pauta: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-tinto flex-shrink-0" />
                                        {pauta}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Público-alvo */}
                            {a.publico_alvo && (
                              <div className="sm:ml-6 flex-shrink-0">
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
                                  <Users size={13} />
                                  <span className="capitalize">{a.publico_alvo}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
