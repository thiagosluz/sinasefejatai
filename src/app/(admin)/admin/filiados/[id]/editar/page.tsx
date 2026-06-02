import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditarForm } from './editar-form'

export default async function EditarFiliadoPage(props: { 
  params: Promise<{ id: string }>
}) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: filiado } = await supabase
    .from('filiados')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!filiado) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/admin/filiados" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Editar Ficha de Filiado</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Atualização Cadastral e Ficha de Membro</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <EditarForm filiado={filiado} />
        </div>
      </div>
    </div>
  )
}
