import { ArrowLeft, History, UserCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getGestoesHistorico as getGestoesConselho } from '@/app/(admin)/admin/conselho-fiscal/actions'
import { getGestoesHistorico as getGestoesDiretoria } from '@/app/(admin)/admin/diretoria/actions'
export const metadata = {
  title: 'Histórico de Diretorias | SINASEFE JATAÍ',
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
  const gestoesDiretoria = await getGestoesDiretoria()
  const gestoesConselho = await getGestoesConselho()

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/diretoria"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <ArrowLeft size={14} />
            Voltar para Atual Direção
          </Link>
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Acervo</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Histórico de Diretorias</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Membros e gestões que construíram o legado do SINASEFE JATAÍ.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-ink font-serif mb-6 border-b border-brand-border-muted pb-2">Diretoria Executiva</h2>
          </div>

          {gestoesDiretoria.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-brand-ink font-serif mb-2">Nenhuma gestão anterior cadastrada</h2>
              <p className="text-zinc-500">O acervo histórico será preenchido em breve.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {gestoesDiretoria.map((gestao: Gestao) => (
                <div key={gestao.id} className="bg-white rounded-2xl border border-brand-border-muted overflow-hidden hover:shadow-md transition-all">
                  {/* Cabeçalho da Gestão */}
                  <div className="bg-brand-cream border-b border-brand-border-muted px-6 py-5 sm:px-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <History size={20} className="text-brand-tinto" />
                    </div>
                    <h2 className="text-xl font-bold font-serif text-brand-ink">
                      {gestao.nome}
                    </h2>
                  </div>

                  {/* Lista de Membros */}
                  <div className="p-6 sm:p-8">
                    {gestao.membros.length === 0 ? (
                      <p className="text-zinc-500 italic">Membros não registrados para esta gestão.</p>
                    ) : (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {gestao.membros.map((membro: Membro) => (
                          <li key={membro.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-border-muted relative shrink-0">
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
                              <p className="text-xs font-semibold uppercase tracking-wider text-brand-tinto mt-0.5">
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

          {/* Histórico do Conselho Fiscal */}
          {gestoesConselho.length > 0 && (
            <div className="mt-20">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-brand-ink font-serif mb-6 border-b border-brand-border-muted pb-2">Conselho Fiscal</h2>
              </div>
              <div className="space-y-8">
                {gestoesConselho.map((gestao: Gestao) => (
                  <div key={gestao.id} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-brand-border-muted overflow-hidden hover:shadow-md transition-all">
                    {/* Cabeçalho da Gestão */}
                    <div className="bg-brand-cream/50 border-b border-brand-border-muted px-6 py-5 sm:px-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <History size={20} className="text-brand-tinto" />
                      </div>
                      <h2 className="text-xl font-bold font-serif text-brand-ink">
                        {gestao.nome}
                      </h2>
                    </div>

                    {/* Lista de Membros */}
                    <div className="p-6 sm:p-8">
                      {gestao.membros.length === 0 ? (
                        <p className="text-zinc-500 italic">Membros não registrados para esta gestão.</p>
                      ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {gestao.membros.map((membro: Membro) => (
                            <li key={membro.id} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-border-muted relative shrink-0">
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-tinto mt-0.5">
                                  {membro.cargo_nome}
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
            </div>
          )}

        </div>
      </section>
    </>
  )
}
