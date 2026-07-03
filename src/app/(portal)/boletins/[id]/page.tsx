import { ArrowLeft, CalendarDays, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { formatarDataPtBR } from '@/lib/date-utils'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function BoletimDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = createAdminClient()

  const { data: boletim, error } = await supabase
    .from('boletins')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('status', 'Publicado')
    .single()

  if (error || !boletim) {
    notFound()
  }

  // Converter o corpo_texto em linhas preservando quebras
  const textoLinhas = boletim.corpo_texto.split('\n').filter((l: string) => l.trim() !== '')

  return (
    <main className="flex flex-col min-h-screen bg-brand-cream">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 45%, #1c1917 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 50%)`,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Publicações</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Boletim Semanal</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Fique por dentro das novidades, informes e ações do sindicato através do nosso Boletim Semanal.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <Link 
          href="/boletins"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-ink/60 hover:text-brand-tinto transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Voltar para Boletins
        </Link>

        <article className="bg-white border-2 border-brand-border shadow-[8px_8px_0px_var(--brand-ink)]">
          {boletim.capa_url && (
            <div className="w-full h-64 sm:h-96 relative border-b-2 border-brand-border overflow-hidden bg-brand-cream flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={boletim.capa_url} 
                alt={boletim.titulo}
                className="object-contain w-full h-full"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 mb-4">
              <CalendarDays size={16} className="text-brand-tinto" />
              {formatarDataPtBR(boletim.data_publicacao)}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-brand-ink mb-8 leading-tight">
              {boletim.titulo}
            </h1>

            <div className="prose prose-zinc max-w-none mb-10">
              <h3 className="text-lg font-bold uppercase tracking-widest text-brand-ink mb-4">Pautas Desta Edição</h3>
              <ul className="space-y-3 list-none pl-0">
                {textoLinhas.map((linha: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-zinc-700 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-tinto flex-shrink-0" />
                    <span className="flex-1">{linha}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-brand-border">
              {boletim.arquivo_pdf_url && (
                <a 
                  href={boletim.arquivo_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-brand-tinto hover:bg-brand-tinto-light text-white text-sm font-serif font-bold uppercase tracking-wider py-4 px-6 flex items-center justify-center gap-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  <FileText size={20} />
                  Ler Boletim Completo (PDF)
                </a>
              )}
              
              {boletim.link_externo && (
                <a 
                  href={boletim.link_externo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-brand-cream hover:bg-brand-card text-brand-ink border-2 border-brand-ink text-sm font-serif font-bold uppercase tracking-wider py-4 px-6 flex items-center justify-center gap-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  <ExternalLink size={20} />
                  Acessar no Site
                </a>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
