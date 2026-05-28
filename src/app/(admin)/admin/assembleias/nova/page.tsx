import Link from 'next/link'
import FormCliente from './form-cliente'
import { createClient } from '@/lib/supabase/server'

export default async function NovaAssembleiaPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const anoAtual = new Date().getFullYear().toString();
  
  // Buscar todas assembleias do ano corrente que não estão canceladas
  // Extrairemos a string de numero para pegar o máximo localmente
  const { data: assembleias } = await supabase
    .from('assembleias')
    .select('numero')
    .gte('data_realizacao', `${anoAtual}-01-01`)
    .lte('data_realizacao', `${anoAtual}-12-31`)
    .neq('status', 'Cancelada');
    
  let maxNum = 0;
  if (assembleias && assembleias.length > 0) {
    assembleias.forEach(a => {
      const parts = a.numero.split('/');
      const num = parseInt(parts[0], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });
  }
  
  const numeroSugerido = `${String(maxNum + 1).padStart(3, '0')}/${anoAtual}`;

  // Buscar locais cadastrados
  const { data: locais } = await supabase
    .from('locais')
    .select('id, nome_curto, texto_completo')
    .order('created_at', { ascending: true });
  
  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/assembleias" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Agendar Assembleia</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider font-medium">Convocatória de Nova Assembleia Geral</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <FormCliente 
            numeroSugerido={numeroSugerido} 
            error={searchParams.error} 
            locais={locais || []} 
          />
        </div>
      </div>
    </div>
  )
}

