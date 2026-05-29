import { getGestaoAtualPublica } from '@/app/(admin)/admin/diretoria/actions'
import { UsersRound, History, UserCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Atual Direção | SINASEFE Jataí',
  description: 'Conheça os membros da atual diretoria do SINASEFE Jataí.',
}

type Membro = {
  id: string
  nome: string | null
  cargo_nome: string
  is_cargo_fixo: boolean
  foto_url: string | null
}

export default async function DiretoriaPublicaPage() {
  const gestao = await getGestaoAtualPublica()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-brand-cream border border-brand-tinto/20 mb-2">
          <UsersRound size={40} className="text-brand-tinto" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-black text-brand-ink uppercase tracking-tight">
          Atual Direção
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl font-serif">
          {gestao 
            ? `Conheça os representantes da ${gestao.nome}, eleitos para defender os direitos da nossa categoria.`
            : 'As informações da diretoria estão sendo atualizadas.'
          }
        </p>

        {gestao && (
          <div className="pt-6">
            <Link 
              href="/diretoria/historico"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-olive text-white text-sm font-bold uppercase tracking-wider hover:bg-brand-olive-light transition-all shadow-[4px_4px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_var(--brand-ink)]"
            >
              <History size={18} />
              Ver Diretorias Anteriores
            </Link>
          </div>
        )}
      </div>

      {gestao && gestao.membros.length > 0 && (
        <div className="space-y-16">
          
          {/* Cadeiras Fixas */}
          <section>
            <h2 className="text-2xl font-serif font-bold text-brand-ink uppercase tracking-wider mb-8 text-center border-b-2 border-brand-olive pb-4 max-w-xs mx-auto">
              Coordenação e Secretaria
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gestao.membros.filter((m: Membro) => m.is_cargo_fixo).map((membro: Membro) => (
                <div key={membro.id} className="bg-white border border-brand-border p-6 shadow-[6px_6px_0px_var(--brand-ink)] flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform">
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
          </section>

          {/* Cargos Extras */}
          {gestao.membros.some((m: Membro) => !m.is_cargo_fixo) && (
            <section className="bg-zinc-50 border border-zinc-200 p-8 sm:p-12">
              <h2 className="text-2xl font-serif font-bold text-brand-ink uppercase tracking-wider mb-8 text-center border-b-2 border-brand-tinto pb-4 max-w-sm mx-auto">
                Assessorias e Diretorias Extras
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gestao.membros.filter((m: Membro) => !m.is_cargo_fixo).map((membro: Membro) => (
                  <div key={membro.id} className="bg-white border border-zinc-300 p-4 flex items-center gap-4">
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
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-olive mt-1">{membro.cargo_nome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  )
}
