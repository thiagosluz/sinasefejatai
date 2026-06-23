import { History, UserCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { getGestaoAtualPublica as getConselhoAtual } from '@/app/(admin)/admin/conselho-fiscal/actions'
import { getGestaoAtualPublica as getDiretoriaAtual } from '@/app/(admin)/admin/diretoria/actions'
export const metadata = {
  title: 'Atual Direção | SINASEFE JATAÍ',
  description: 'Conheça os membros da atual diretoria do SINASEFE JATAÍ.',
}

type Membro = {
  id: string
  nome: string | null
  cargo_nome: string
  is_cargo_fixo: boolean
  foto_url: string | null
}

export default async function DiretoriaPublicaPage() {
  const gestaoRaw = await getDiretoriaAtual()
  const conselhoRaw = await getConselhoAtual()

  // Filtra cadeiras vagas (sem nome preenchido)
  const gestao = gestaoRaw ? { ...gestaoRaw, membros: gestaoRaw.membros.filter((m: Membro) => m.nome && m.nome.trim().length > 0) } : null
  const conselho = conselhoRaw ? { ...conselhoRaw, membros: conselhoRaw.membros.filter((m: Membro) => m.nome && m.nome.trim().length > 0) } : null

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
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Atual Direção</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            {gestao
              ? `Conheça os representantes da gestão ${gestao.nome}, eleitos para defender os direitos da nossa categoria.`
              : 'As informações da diretoria estão sendo atualizadas.'
            }
          </p>
          {gestao && (
            <div className="mt-8">
              <Link
                href="/diretoria/historico"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3 rounded-full hover:border-white hover:bg-white/10 transition-all text-sm backdrop-blur-sm"
              >
                <History size={16} />
                Ver Diretorias Anteriores
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {gestao && gestao.membros.length > 0 && (
            <div className="space-y-16">

              {/* Cadeiras Fixas */}
              {gestao.membros.some((m: Membro) => m.is_cargo_fixo) && (
                <div>
                  <div className="text-center mb-10">
                    <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-2">Gestão Executiva</p>
                    <h2 className="text-3xl font-bold text-brand-ink font-serif">Coordenação e Secretaria</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gestao.membros.filter((m: Membro) => m.is_cargo_fixo).map((membro: Membro) => (
                      <div key={membro.id} className="bg-white rounded-2xl border border-brand-border-muted p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-all">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-cream relative">
                          {membro.foto_url ? (
                            <Image
                              src={membro.foto_url}
                              alt={membro.nome || membro.cargo_nome}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                              <UserCircle2 size={64} strokeWidth={1} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-serif text-brand-ink">{membro.nome || 'Cadeira Vaga'}</h3>
                          <p className="text-sm font-bold uppercase tracking-widest text-brand-tinto mt-2">{membro.cargo_nome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cargos Extras */}
              {gestao.membros.some((m: Membro) => !m.is_cargo_fixo) && (
                <div>
                  <div className="text-center mb-10">
                    <p className="text-brand-tinto font-semibold text-sm uppercase tracking-widest mb-2">Corpo Diretivo</p>
                    <h2 className="text-3xl font-bold text-brand-ink font-serif">Assessorias e Diretorias Extras</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gestao.membros.filter((m: Membro) => !m.is_cargo_fixo).map((membro: Membro) => (
                      <div key={membro.id} className="bg-white rounded-2xl border border-brand-border-muted p-4 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-cream relative shrink-0">
                          {membro.foto_url ? (
                            <Image
                              src={membro.foto_url}
                              alt={membro.nome || membro.cargo_nome}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                              <UserCircle2 size={32} strokeWidth={1} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold font-serif text-brand-ink text-lg leading-tight">{membro.nome || 'Vago'}</h3>
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-tinto mt-1">{membro.cargo_nome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {conselho && conselho.membros && conselho.membros.length > 0 && (
            <div className="mt-16 pt-16 border-t border-brand-border-muted/50">
              <div className="text-center mb-10">
                <p className="text-brand-ink/60 font-semibold text-sm uppercase tracking-widest mb-2">Órgão Independente</p>
                <h2 className="text-3xl font-bold text-brand-ink font-serif">Conselho Fiscal</h2>
                <p className="text-brand-ink/70 mt-2">Membros eleitos para compor o conselho da gestão {conselho.nome}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {conselho.membros.map((membro: Membro) => (
                  <div key={membro.id} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-brand-border-muted p-4 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-cream relative shrink-0">
                      {membro.foto_url ? (
                        <Image
                          src={membro.foto_url}
                          alt={membro.nome || membro.cargo_nome}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                          <UserCircle2 size={32} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold font-serif text-brand-ink text-lg leading-tight">{membro.nome || 'Vago'}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink/70 mt-1">{membro.cargo_nome}</p>
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
