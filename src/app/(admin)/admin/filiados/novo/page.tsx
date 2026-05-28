import Link from 'next/link'
import { addFiliado } from '../actions'

export default async function NovoFiliadoPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/admin/filiados" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Nova Ficha de Filiado</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Abertura de Cadastro na Seção Sindical</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <form action={addFiliado} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome Completo */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Nome Completo *
                </label>
                <input 
                  id="nome"
                  name="nome"
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: João da Silva"
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
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: joao@email.com"
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
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: (64) 99999-9999"
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
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: 1234567"
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
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: Professor EBTT"
                />
              </div>
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
                  href="/admin/filiados"
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
