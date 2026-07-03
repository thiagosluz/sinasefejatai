import { formatarTipo } from '@/app/(admin)/admin/documentos/lib/tipos-documento'
import { createAdminClient } from '@/lib/supabase/admin'

import { DocumentosCliente } from './documentos-cliente'

export const dynamic = 'force-dynamic'

type DocumentoItem = {
  id: string
  titulo: string
  categoria: string
  data: string
  tipo: 'externo' | 'resolucao'
  url: string
}

async function getDocumentosPublicos(): Promise<DocumentoItem[]> {
  const supabase = createAdminClient()
  const items: DocumentoItem[] = []

  // 1. Buscar Publicações Externas
  const { data: publicacoes } = await supabase
    .from('publicacoes')
    .select('id, titulo, categoria, data_publicacao, arquivo_url')
    
  if (publicacoes) {
    publicacoes.forEach(p => {
      items.push({
        id: p.id,
        titulo: p.titulo,
        categoria: p.categoria,
        data: p.data_publicacao,
        tipo: 'externo',
        url: p.arquivo_url
      })
    })
  }

  // 2. Buscar Resoluções Públicas
  const { data: resolucoes } = await supabase
    .from('documentos_administrativos')
    .select('id, tipo, titulo, numero, data_emissao')
    .eq('is_publico', true)
    .eq('status', 'ativo')

  if (resolucoes) {
    resolucoes.forEach(r => {
      items.push({
        id: r.id,
        titulo: r.titulo,
        categoria: formatarTipo(r.tipo) + (r.numero ? ` Nº ${r.numero}` : ''),
        data: r.data_emissao,
        tipo: 'resolucao',
        url: `/documentos/resolucoes/${r.id}`
      })
    })
  }

  // Ordenar por data decrescente
  items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return items
}

export default async function DocumentosPublicosPage() {
  const documentos = await getDocumentosPublicos()

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
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Transparência</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Documentos Públicos</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Acesso público a regimentos, notas, resoluções normativas e balanços do SINASEFE JATAÍ.
          </p>
        </div>
      </section>

      <DocumentosCliente documentos={documentos} />
    </>
  )
}
