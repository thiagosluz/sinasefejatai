import { createAdminClient } from '@/lib/supabase/admin'

import { AssembleiasCliente } from './assembleias-cliente'

export const dynamic = 'force-dynamic'

async function getAssembleias() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('assembleias')
    .select('id, numero, tipo, data_realizacao, horario_1a_convocacao, local, status, pautas, publico_alvo')
    .neq('status', 'Rascunho')
    .order('data_realizacao', { ascending: false })
  return data ?? []
}

export default async function AssembleiasPublicasPage() {
  const assembleias = await getAssembleias()

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 45%, #1c1917 100%)' }}
      >
        {/* Padrão de fundo sutil */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 50%)`,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Transparência</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Assembleias</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Acompanhe as reuniões deliberativas do SINASEFE JATAÍ. Aqui estão registrados os editais de convocação, pautas e resultados de todas as assembleias realizadas.
          </p>
        </div>
      </section>

      <AssembleiasCliente assembleias={assembleias} />
    </>
  )
}
