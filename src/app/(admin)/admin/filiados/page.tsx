import { createClient } from '@/lib/supabase/server'
import { PlusCircle, Edit2, UserX, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { toggleAtivo } from './actions'

export default async function FiliadosPage() {
  const supabase = await createClient()

  // Buscar filiados ordenados por nome
  const { data: filiados } = await supabase
    .from('filiados')
    .select('*')
    .order('nome', { ascending: true })

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Gestão de Filiados</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Módulo de Cadastros e Fichas Sindicais</p>
        </div>
        <Link 
          href="/admin/filiados/novo" 
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Cadastrar Filiado</span>
        </Link>
      </header>

      {/* Tabela estilo Fichário Físico */}
      <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
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
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        filiado.ativo 
                          ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
                          : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                      }`}>
                        {filiado.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3.5">
                        <Link 
                          href={`/admin/filiados/${filiado.id}/editar`}
                          className="p-1 hover:bg-brand-ink/10 text-brand-ink/70 hover:text-brand-ink transition-all"
                          title="Editar Ficha"
                        >
                          <Edit2 size={15} />
                        </Link>
                        
                        <form action={toggleAtivo.bind(null, filiado.id, filiado.ativo)}>
                          <button 
                            type="submit"
                            className={`p-1 hover:bg-brand-ink/10 transition-colors cursor-pointer ${
                              filiado.ativo ? 'text-brand-tinto hover:text-brand-tinto-light' : 'text-brand-olive hover:text-brand-olive-light'
                            }`}
                            title={filiado.ativo ? 'Desativar Ficha' : 'Reativar Ficha'}
                          >
                            {filiado.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
