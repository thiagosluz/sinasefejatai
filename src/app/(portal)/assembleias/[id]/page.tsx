import { ArrowLeft, CalendarDays, FileText, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatarDataPtBR, formatarHora } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

interface DocumentoPublico {
  id: string
  tipo: string
  nome_arquivo: string
  arquivo_url: string
  created_at: string
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

function formatDocType(tipo: string) {
  switch (tipo) {
    case 'ata': return 'Ata da Assembleia'
    case 'edital': return 'Edital de Convocação'
    case 'presenca': return 'Lista de Presença'
    case 'prestacao_caixa': return 'Prestação de Contas'
    case 'anexo': return 'Documento Anexo'
    default: return tipo.toUpperCase()
  }
}

export default async function AssembleiaDetalhesPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!assembleia) {
    notFound()
  }

  const { data: docs } = await supabase
    .from('assembleia_documentos')
    .select('id, tipo, nome_arquivo, arquivo_url, created_at')
    .eq('assembleia_id', params.id)
    .order('created_at', { ascending: true })

  const documentos = (docs || []) as DocumentoPublico[]

  const orderDocs = ['edital', 'presenca', 'ata', 'prestacao_caixa', 'anexo']
  documentos.sort((a, b) => {
    return orderDocs.indexOf(a.tipo) - orderDocs.indexOf(b.tipo)
  })

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
          <Link
            href="/assembleias"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <ArrowLeft size={14} />
            Voltar para lista
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
              {assembleia.status}
            </span>
            {assembleia.tipo && (
              <span className="bg-white/10 text-white/90 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                {assembleia.tipo}
              </span>
            )}
            {assembleia.numero && (
              <span className="text-white/80 font-mono text-sm">
                Nº {assembleia.numero}
              </span>
            )}
          </div>

          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Detalhes da Assembleia</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-6 leading-tight">
            Assembleia {assembleia.tipo} — Nº {assembleia.numero}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-white/90">
            <div className="md:col-span-4 lg:col-span-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarDays size={18} className="text-white/80" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-0.5">Data e Horário</span>
                <span className="font-medium capitalize">{formatDate(assembleia.data_realizacao)}</span>
                <span className="text-sm opacity-70 mt-0.5 whitespace-nowrap">
                  1ª Conv: {formatTime(assembleia.horario_1a_convocacao)}<br className="hidden lg:block" /> 
                  <span className="lg:hidden"> | </span>
                  2ª Conv: {formatTime(assembleia.horario_2a_convocacao)}
                </span>
              </div>
            </div>

            <div className="md:col-span-5 lg:col-span-6 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={18} className="text-white/80" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-0.5">Local</span>
                <span className="font-medium leading-relaxed">{assembleia.local}</span>
              </div>
            </div>

            {assembleia.publico_alvo && (
              <div className="md:col-span-3 lg:col-span-3 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users size={18} className="text-white/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-0.5">Público-Alvo</span>
                  <span className="font-medium capitalize">{assembleia.publico_alvo}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Pautas */}
          <div>
            <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-2">Ordem do Dia</p>
            <h2 className="text-3xl font-bold text-brand-ink font-serif mb-6">Pontos de Pauta</h2>
            {assembleia.pautas && assembleia.pautas.length > 0 ? (
              <div className="bg-white rounded-2xl border border-brand-border-muted p-6 sm:p-8">
                <ul className="space-y-3">
                  {assembleia.pautas.map((pauta: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700">
                      <span className="mt-2 w-2 h-2 rounded-full bg-brand-tinto flex-shrink-0" />
                      <span className="text-lg leading-relaxed">{pauta}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-zinc-500 italic">Nenhuma pauta cadastrada para esta assembleia.</p>
            )}
          </div>

          {/* Documentos */}
          <div>
            <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-2">Transparência</p>
            <h2 className="text-3xl font-bold text-brand-ink font-serif mb-6">Documentos Públicos</h2>

            {documentos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentos.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-2xl border border-brand-border-muted p-5 transition-all hover:shadow-md hover:border-brand-tinto/30 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-tinto flex items-center justify-center flex-shrink-0 group-hover:bg-brand-tinto group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">{formatDocType(doc.tipo)}</p>
                      <p className="font-bold text-brand-ink group-hover:text-brand-tinto transition-colors line-clamp-2">{doc.nome_arquivo}</p>
                      <span className="text-xs font-semibold text-brand-tinto uppercase tracking-widest mt-2 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                        Baixar PDF →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-brand-border-muted p-12 text-center">
                <FileText className="mx-auto text-zinc-300 mb-3" size={48} />
                <p className="text-zinc-500 font-medium">Os documentos desta assembleia ainda não foram publicados.</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  )
}
