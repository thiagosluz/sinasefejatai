import Link from 'next/link'
import { addAssembleia } from '../actions'

export default async function NovaAssembleiaPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/assembleias" className="text-zinc-400 hover:text-white transition-colors mb-4 inline-block">&larr; Voltar para lista</Link>
        <h1 className="text-2xl font-bold">Agendar Assembleia</h1>
        <p className="text-zinc-400 mt-1">Crie uma nova assembleia para gerar os documentos.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <form action={addAssembleia} className="p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="numero" className="text-sm font-medium text-zinc-300">Nº do Edital</label>
              <input 
                id="numero"
                name="numero"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Ex: 001/2026"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="tipo" className="text-sm font-medium text-zinc-300">Tipo *</label>
              <select 
                id="tipo"
                name="tipo"
                required
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-zinc-100"
              >
                <option value="Ordinária">Ordinária</option>
                <option value="Extraordinária">Extraordinária</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="data_realizacao" className="text-sm font-medium text-zinc-300">Data *</label>
              <input 
                id="data_realizacao"
                name="data_realizacao"
                type="date"
                required
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="local" className="text-sm font-medium text-zinc-300">Local *</label>
              <input 
                id="local"
                name="local"
                required
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Ex: Auditório Principal"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="horario_1a_convocacao" className="text-sm font-medium text-zinc-300">Horário 1ª Convocação *</label>
              <input 
                id="horario_1a_convocacao"
                name="horario_1a_convocacao"
                type="time"
                required
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="horario_2a_convocacao" className="text-sm font-medium text-zinc-300">Horário 2ª Convocação *</label>
              <input 
                id="horario_2a_convocacao"
                name="horario_2a_convocacao"
                type="time"
                required
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="pautas" className="text-sm font-medium text-zinc-300">Pautas (uma por linha) *</label>
              <textarea 
                id="pautas"
                name="pautas"
                required
                rows={4}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                placeholder="Informe as pautas que serão discutidas..."
              />
            </div>
          </div>

          <div className="pt-6 mt-2 border-t border-zinc-800 flex items-center justify-end gap-3">
            {searchParams.error && (
              <div className="flex-1 text-red-400 text-sm">
                {searchParams.error}
              </div>
            )}
            <Link 
              href="/assembleias"
              className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors font-medium shadow-lg shadow-emerald-900/20"
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
