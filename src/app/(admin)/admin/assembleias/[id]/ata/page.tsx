import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AtaEditorCliente from './editor-cliente'

interface AtaPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

export default async function AtaPage({ params, searchParams }: AtaPageProps) {
  const supabase = await createClient()

  // Validar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { id } = await params
  const resolvedSearchParams = await searchParams

  // Buscar assembleia
  const { data: assembleia, error: assembleiaError } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', id)
    .single()

  if (assembleiaError || !assembleia) {
    return redirect('/admin/assembleias?error=Assembleia não encontrada')
  }

  // Buscar ata se já existir
  const { data: ata } = await supabase
    .from('atas')
    .select('*')
    .eq('assembleia_id', id)
    .single()

  // Buscar configurações de cabeçalho
  const { data: config } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('id', 1)
    .single()

  return (
    <div className="min-h-screen bg-brand-cream p-4 md:p-8 text-brand-ink print:bg-white print:p-0 print:text-black font-sans selection:bg-brand-tinto selection:text-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 print:hidden gap-4">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/assembleias" className="text-zinc-555 hover:text-brand-ink transition-colors font-semibold text-sm">&larr; Assembleias</Link>
            <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Redigir Ata de Assembleia</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">
            Assembleia {assembleia.tipo} • Edital {assembleia.numero || 'S/N'} • {new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </header>

      {resolvedSearchParams.success && (
        <div className="bg-brand-cream border-2 border-dashed border-brand-olive text-brand-olive px-4 py-3.5 text-xs font-bold uppercase tracking-wider mb-6 print:hidden">
          {resolvedSearchParams.success}
        </div>
      )}

      {resolvedSearchParams.error && (
        <div className="bg-brand-cream border-2 border-dashed border-brand-tinto text-brand-tinto px-4 py-3.5 text-xs font-bold uppercase tracking-wider mb-6 print:hidden">
          {resolvedSearchParams.error}
        </div>
      )}

      <AtaEditorCliente 
        assembleia={assembleia} 
        ataInicial={ata || undefined} 
        config={config}
      />
    </div>
  )
}
