import { getGestoesHistorico } from '@/app/(admin)/admin/diretoria/actions'
import { History, ArrowLeft, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Histórico de Diretorias | SINASEFE Jataí',
  description: 'Acervo e histórico das gestões passadas do sindicato.',
}

type Membro = {
  id: string
  nome: string | null
  cargo_nome: string
  is_cargo_fixo: boolean
  foto_url: string | null
}

type Gestao = {
  id: string
  nome: string
  membros: Membro[]
}

export default async function HistoricoDiretoriaPage() {
  const gestoesHistorico = await getGestoesHistorico()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <Link 
          href="/diretoria"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Voltar para Atual Direção
        </Link>
        <div className="inline-flex items-center justify-center p-3 bg-brand-cream border border-brand-olive/20 mb-2">
          <History size={40} className="text-brand-olive" />
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-black text-brand-ink uppercase tracking-tight">
          Acervo Histórico
        </h1>
        <p className="text-lg text-zinc-600 font-serif">
          Membros e gestões que construíram o legado do SINASEFE Jataí.
        </p>
      </div>

      {gestoesHistorico.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 border border-zinc-200">
          <p className="text-zinc-500 font-medium">Nenhuma gestão anterior cadastrada no acervo.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {gestoesHistorico.map((gestao: Gestao) => (
            <div key={gestao.id} className="bg-white border border-brand-border shadow-[6px_6px_0px_var(--brand-ink)]">
              {/* Cabeçalho da Gestão */}
              <div className="bg-brand-ink text-white p-6 md:p-8 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold uppercase tracking-wider">
                  {gestao.nome}
                </h2>
              </div>
              
              {/* Lista de Membros da Gestão */}
              <div className="p-6 md:p-8">
                {gestao.membros.length === 0 ? (
                  <p className="text-zinc-500 italic">Membros não registrados para esta gestão.</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {gestao.membros.map((membro: Membro) => (
                       <li key={membro.id} className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 relative shrink-0">
                            {membro.foto_url ? (
                              <Image 
                                src={membro.foto_url} 
                                alt={membro.nome || membro.cargo_nome} 
                                fill 
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                                <UserCircle2 size={24} strokeWidth={1} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-brand-ink font-serif leading-tight text-lg">
                              {membro.nome || 'Vago'}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">
                              {membro.cargo_nome} {membro.is_cargo_fixo ? '' : '(Extra)'}
                            </p>
                          </div>
                       </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
