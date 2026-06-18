import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/server'

import FiliadoActions from './components/filiado-actions'
import ImportarPlanilhaButton from './components/importar-planilha-button'

export default async function FiliadosPage() {
  const supabase = await createClient()

  // Buscar filiados ordenados por nome
  const { data: filiados } = await supabase
    .from('filiados')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Gestão de Filiados" subtitulo="Módulo de Cadastros e Fichas Sindicais">
        <div className="flex items-center gap-3">
          <ImportarPlanilhaButton />
          
          <Link 
            href="/admin/filiados/novo" 
            className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Cadastrar Filiado</span>
          </Link>
        </div>
      </AdminPageHeader>

      {/* Tabela estilo Fichário Físico */}
      <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
            <thead className="bg-brand-cream border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 border-r border-zinc-350">Nome do Filiado</th>
                <th className="px-6 py-4 border-r border-zinc-350">Endereço de E-mail</th>
                <th className="px-6 py-4 border-r border-zinc-350">SIAPE / Cargo de Exercício</th>
                <th className="px-6 py-4 border-r border-zinc-350 text-center">Situação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {!filiados || filiados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-550 italic font-serif">
                    Nenhum registro de filiado arquivado neste momento.
                  </td>
                </tr>
              ) : (
                filiados.map((filiado) => (
                  <tr key={filiado.id} className="hover:bg-brand-ink/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-ink border-r border-brand-border">
                      {filiado.nome}
                      {filiado.telefone && (
                        <div className="text-[11px] text-zinc-600 font-normal mt-0.5 tracking-wide">{filiado.telefone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-brand-ink/80 border-r border-brand-border text-xs font-medium">{filiado.email || '-'}</td>
                    <td className="px-6 py-4 border-r border-brand-border">
                      <div className="text-brand-ink text-xs font-bold">{filiado.siape || '-'}</div>
                      <div className="text-[11px] text-brand-ink/60 font-semibold uppercase tracking-wider">{filiado.cargo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-center border-r border-brand-border">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          filiado.ativo 
                            ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
                            : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                        }`}>
                          {filiado.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        
                        {filiado.status_filiacao === 'pendente' && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                            Pendente
                          </span>
                        )}
                        {filiado.status_filiacao === 'desfiliado' && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                            Desfiliado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <FiliadoActions filiado={filiado} />
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
