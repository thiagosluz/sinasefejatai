import { Calculator } from 'lucide-react'

import { CalculadoraCliente } from './components/calculadora-cliente'

export const metadata = {
  title: 'Calculadora RSC-TAE | SINASEFE JATAÍ',
  description: 'Calcule sua pontuação para o Reconhecimento de Saberes e Competências (RSC) dos Técnico-Administrativos em Educação, conforme o Decreto nº 13.048/2026.',
}

export default function CalculadoraRSCPage() {
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
          <div className="flex items-center gap-3 mb-3">
            <Calculator size={20} className="text-red-300" />
            <p className="text-red-300 font-semibold text-sm uppercase tracking-widest">Ferramenta</p>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-serif mb-4">
            Calculadora RSC-TAE
          </h1>
          <p className="text-white/75 text-lg max-w-2xl">
            Calcule sua pontuação para o Reconhecimento de Saberes e Competências dos Técnico-Administrativos em Educação, conforme o Decreto nº 13.048/2026. Gere e baixe o Memorial descritivo.
          </p>
        </div>
      </section>

      <CalculadoraCliente />
    </main>
  )
}
