import Link from 'next/link'
import { editFiliado } from '../../actions'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditarFiliadoPage(props: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ error?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const { data: filiado } = await supabase
    .from('filiados')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!filiado) {
    notFound()
  }

  const updateFiliadoWithId = editFiliado.bind(null, filiado.id)

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/filiados" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Editar Ficha de Filiado</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Atualização Cadastral e Ficha de Membro</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <form action={updateFiliadoWithId} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome Completo */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Nome Completo *
                </label>
                <input 
                  id="nome"
                  name="nome"
                  defaultValue={filiado.nome}
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* E-mail */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Endereço de E-mail
                </label>
                <input 
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={filiado.email || ''}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Telefone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="telefone" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Telefone / WhatsApp
                </label>
                <input 
                  id="telefone"
                  name="telefone"
                  defaultValue={filiado.telefone || ''}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Matrícula SIAPE */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="siape" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Matrícula SIAPE
                </label>
                <input 
                  id="siape"
                  name="siape"
                  defaultValue={filiado.siape || ''}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Cargo */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cargo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Cargo / Função
                </label>
                <input 
                  id="cargo"
                  name="cargo"
                  defaultValue={filiado.cargo || ''}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>
            </div>

            {/* Checkbox Ativo/Inativo */}
            <div className="mt-4 pt-4 border-t border-dashed border-zinc-300 flex items-center gap-3">
              <input 
                type="checkbox" 
                id="ativo" 
                name="ativo" 
                defaultChecked={filiado.ativo}
                className="w-4 h-4 rounded-none border-zinc-400 bg-brand-cream text-brand-tinto focus:ring-brand-tinto cursor-pointer"
              />
              <label htmlFor="ativo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif cursor-pointer">
                Ficha Cadastral Ativa (Filiado com direitos plenos)
              </label>
            </div>

            {/* Ações */}
            <div className="pt-6 mt-2 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row justify-end items-center gap-4">
              {searchParams.error && (
                <div className="text-brand-tinto text-xs font-bold uppercase tracking-wider flex-1 text-center sm:text-left">
                  {searchParams.error}
                </div>
              )}
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Link 
                  href="/filiados"
                  className="flex-1 sm:flex-none text-center border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit"
                  className="flex-1 sm:w-auto bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] active:scale-98 cursor-pointer"
                >
                  Salvar Ficha &rarr;
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
