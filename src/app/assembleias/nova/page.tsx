import Link from 'next/link'
import { addAssembleia } from '../actions'

export default async function NovaAssembleiaPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/assembleias" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Agendar Assembleia</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider font-medium">Convocatória de Nova Assembleia Geral</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <form action={addAssembleia} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nº do Edital */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="numero" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Nº do Edital
                </label>
                <input 
                  id="numero"
                  name="numero"
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: 001/2026"
                />
              </div>

              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tipo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Tipo de Assembleia *
                </label>
                <select 
                  id="tipo"
                  name="tipo"
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer"
                >
                  <option value="Ordinária">Ordinária</option>
                  <option value="Extraordinária">Extraordinária</option>
                </select>
              </div>

              {/* Data */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="data_realizacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Data de Realização *
                </label>
                <input 
                  id="data_realizacao"
                  name="data_realizacao"
                  type="date"
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Local */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="local" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Local de Encontro *
                </label>
                <input 
                  id="local"
                  name="local"
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: Auditório Principal"
                />
              </div>

              {/* Horário 1ª Convocação */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="horario_1a_convocacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Horário 1ª Convocação *
                </label>
                <input 
                  id="horario_1a_convocacao"
                  name="horario_1a_convocacao"
                  type="time"
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Horário 2ª Convocação */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="horario_2a_convocacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Horário 2ª Convocação *
                </label>
                <input 
                  id="horario_2a_convocacao"
                  name="horario_2a_convocacao"
                  type="time"
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Pautas */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="pautas" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Pauta de Deliberações (uma por linha) *
                </label>
                <textarea 
                  id="pautas"
                  name="pautas"
                  required
                  rows={4}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto resize-none font-medium leading-relaxed"
                  placeholder="Informe os pontos de pauta da assembleia..."
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
                  href="/assembleias"
                  className="flex-1 sm:flex-none text-center border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit"
                  className="flex-1 sm:w-auto bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] active:scale-98 cursor-pointer"
                >
                  Agendar Assembleia &rarr;
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
