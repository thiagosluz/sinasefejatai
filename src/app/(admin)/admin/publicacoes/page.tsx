import { FileText, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import DeletePublicacaoButton from './components/delete-button'

export default async function PublicacoesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: publicacoes } = await supabase
    .from('publicacoes')
    .select('*')
    .order('data_publicacao', { ascending: false })

  return (
    <AdminPageWrapper>
      <AdminPageHeader
        titulo="Portal Público"
        subtitulo="Documentos Externos, Regimentos e Transparência"
      >
        <Link
          href="/admin/publicacoes/novo"
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Nova Publicação</span>
        </Link>
      </AdminPageHeader>

      <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-brand-cream/50 uppercase text-[10px] tracking-wider font-bold border-y border-brand-border">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Arquivo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {!publicacoes || publicacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 italic">
                    Nenhuma publicação encontrada.
                  </td>
                </tr>
              ) : (
                publicacoes.map((pub) => (
                  <tr key={pub.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {formatarDataPtBR(pub.data_publicacao)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold block uppercase text-[10px] tracking-wider text-brand-ink/70">
                        {pub.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {pub.titulo}
                    </td>
                    <td className="px-4 py-3">
                      <a href={pub.arquivo_url} target="_blank" rel="noreferrer" className="text-brand-tinto hover:underline flex items-center gap-1 text-xs font-medium">
                        <FileText size={14} /> Ver PDF
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeletePublicacaoButton id={pub.id} titulo={pub.titulo} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
