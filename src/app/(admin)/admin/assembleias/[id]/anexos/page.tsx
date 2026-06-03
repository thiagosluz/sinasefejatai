import { ArrowLeft, Paperclip } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { formatarDataExtenso } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import AnexosManager from './anexos-manager'

export default async function AssembleiaAnexosPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('id, tipo, numero, data_realizacao')
    .eq('id', params.id)
    .single()

  if (!assembleia) {
    notFound()
  }

  // Busca todos os documentos do tipo genérico "anexo"
  const { data: anexos } = await supabase
    .from('assembleia_documentos')
    .select('*')
    .eq('assembleia_id', params.id)
    .eq('tipo', 'anexo')
    .order('created_at', { ascending: false })

  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Anexos Extras" 
        subtitulo={`Gerencie arquivos complementares para a Assembleia ${assembleia.tipo}`}
      >
        <Link 
          href="/admin/assembleias" 
          className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Voltar
        </Link>
      </AdminPageHeader>

      <div className="bg-brand-card border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] mb-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-zinc-800 text-white rounded-none flex items-center justify-center flex-shrink-0">
          <Paperclip size={24} />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-brand-ink mb-1">
            Assembleia Geral {assembleia.tipo} {assembleia.numero ? `— Nº ${assembleia.numero}` : ''}
          </h2>
          <p className="text-xs font-bold text-brand-ink/60 uppercase tracking-widest">
            {formatarDataExtenso(assembleia.data_realizacao)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-brand-border p-6 sm:p-8 shadow-[4px_4px_0px_var(--brand-ink)]">
        <div className="mb-6">
          <h3 className="font-serif font-bold text-lg text-brand-ink mb-2">Arquivos Anexados</h3>
          <p className="text-sm text-zinc-600">
            Faça upload de arquivos PDF adicionais como Slides de Apresentação, Ofícios, Prestações de Conta ou Pareceres.
            Eles ficarão disponíveis na página pública da assembleia.
          </p>
        </div>

        <AnexosManager assembleiaId={assembleia.id} anexosIniciais={anexos || []} />
      </div>

    </AdminPageWrapper>
  )
}
