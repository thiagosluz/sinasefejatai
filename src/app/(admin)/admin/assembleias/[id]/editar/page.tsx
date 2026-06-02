import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { EditarForm } from './editar-form'

export default async function EditarAssembleiaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  
  const supabase = await createClient()
  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', id)
    .single()

  const { data: locais } = await supabase
    .from('locais')
    .select('*')
    .order('nome_curto')

  if (!assembleia) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/admin/assembleias" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Editar Assembleia</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider font-medium">Continuar Edição da Convocatória</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <EditarForm assembleia={assembleia} locais={locais || []} />
        </div>
      </div>
    </div>
  )
}
