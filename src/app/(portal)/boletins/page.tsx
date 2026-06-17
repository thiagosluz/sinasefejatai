import { createClient } from '@/lib/supabase/server'

import { BoletinsCliente } from './boletins-cliente'

export const metadata = {
  title: 'Boletim Semanal | SINASEFE JATAÍ',
  description: 'Fique por dentro das novidades, informes e ações do sindicato através do nosso Boletim Semanal.',
}

export default async function BoletinsPage() {
  const supabase = await createClient()

  // Buscar todos os boletins publicados
  const { data: boletins } = await supabase
    .from('boletins')
    .select('id, titulo, data_publicacao, capa_url, status')
    .eq('status', 'Publicado')
    .order('data_publicacao', { ascending: false })

  return (
    <main className="flex flex-col min-h-screen bg-brand-cream">
      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 45%, #1c1917 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 50%)`,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-300 font-semibold text-sm uppercase tracking-widest mb-3">Publicações</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">Boletim Semanal</h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Fique por dentro das novidades, informes e ações do sindicato através do nosso Boletim Semanal.
          </p>
        </div>
      </section>

      <BoletinsCliente boletins={boletins || []} />
    </main>
  )
}
