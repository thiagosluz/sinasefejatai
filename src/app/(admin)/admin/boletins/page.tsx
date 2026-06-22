import { Edit, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/server'

import DeleteBoletimButton from './components/delete-button'
import DisparoBoletimBtn from './components/disparo-boletim-btn'

export default async function BoletinsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: boletins } = await supabase
    .from('boletins')
    .select('id, titulo, data_publicacao, status')
    .order('data_publicacao', { ascending: false })

  return (
    <AdminPageWrapper>
      <AdminPageHeader
        titulo="Boletins Semanais"
        subtitulo="Gerencie as edições semanais do SINASEFE"
      >
        <Link
          href="/admin/boletins/novo"
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Novo Boletim</span>
        </Link>
      </AdminPageHeader>

      <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-brand-cream/50 uppercase text-[10px] tracking-wider font-bold border-y border-brand-border">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {!boletins || boletins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 italic">
                    Nenhum boletim encontrado.
                  </td>
                </tr>
              ) : (
                boletins.map((bol) => (
                  <tr key={bol.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {formatarDataPtBR(bol.data_publicacao)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {bol.titulo}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        bol.status === 'Publicado' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {bol.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/admin/boletins/${bol.id}/editar`}
                          className="p-1.5 text-brand-ink/40 hover:text-brand-ink hover:bg-zinc-100 rounded transition-colors"
                          title="Editar Boletim"
                        >
                          <Edit size={16} />
                        </Link>
                        {bol.status === 'Publicado' && (
                          <DisparoBoletimBtn id={bol.id} titulo={bol.titulo} />
                        )}
                        <DeleteBoletimButton id={bol.id} titulo={bol.titulo} />
                      </div>
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
