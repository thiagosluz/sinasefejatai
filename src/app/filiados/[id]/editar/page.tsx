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

  // Bind the id to the action
  const updateFiliadoWithId = editFiliado.bind(null, filiado.id)

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/filiados" className="text-zinc-400 hover:text-white transition-colors mb-4 inline-block">&larr; Voltar para lista</Link>
        <h1 className="text-2xl font-bold">Editar Filiado</h1>
        <p className="text-zinc-400 mt-1">Atualize as informações do membro.</p>
      </header>

      <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <form action={updateFiliadoWithId} className="p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="nome" className="text-sm font-medium text-zinc-300">Nome Completo *</label>
              <input 
                id="nome"
                name="nome"
                defaultValue={filiado.nome}
                required
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">E-mail</label>
              <input 
                id="email"
                name="email"
                type="email"
                defaultValue={filiado.email || ''}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="telefone" className="text-sm font-medium text-zinc-300">Telefone / WhatsApp</label>
              <input 
                id="telefone"
                name="telefone"
                defaultValue={filiado.telefone || ''}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="siape" className="text-sm font-medium text-zinc-300">Matrícula SIAPE</label>
              <input 
                id="siape"
                name="siape"
                defaultValue={filiado.siape || ''}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="cargo" className="text-sm font-medium text-zinc-300">Cargo</label>
              <input 
                id="cargo"
                name="cargo"
                defaultValue={filiado.cargo || ''}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3">
            <input 
              type="checkbox" 
              id="ativo" 
              name="ativo" 
              defaultChecked={filiado.ativo}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-zinc-900"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-zinc-300">
              Filiado Ativo
            </label>
          </div>

          <div className="pt-6 mt-2 border-t border-zinc-800 flex justify-end gap-3">
            {searchParams.error && (
              <div className="flex-1 text-red-400 text-sm flex items-center">
                {searchParams.error}
              </div>
            )}
            <Link 
              href="/filiados"
              className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors font-medium shadow-lg shadow-emerald-900/20"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
