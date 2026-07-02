'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { salvarValoresReferencia, ValoresReferencia } from './actions'

interface Props {
  initialValores: ValoresReferencia
}

export default function ConfiguracoesGeraisCliente({ initialValores }: Props) {
  const [salario, setSalario] = useState(initialValores.salario_minimo.toString())
  const [ano, setAno] = useState(initialValores.ano.toString())
  const [salvando, setSalvando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const numSalario = parseFloat(salario.replace(',', '.'))
    const numAno = parseInt(ano, 10)

    if (isNaN(numSalario) || isNaN(numAno)) {
      toast.error('Valores inválidos.')
      return
    }

    setSalvando(true)
    const res = await salvarValoresReferencia({ salario_minimo: numSalario, ano: numAno })
    setSalvando(false)

    if (res.success) {
      toast.success('Parâmetros salvos com sucesso!')
    } else {
      toast.error(res.error || 'Erro ao salvar.')
    }
  }

  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Configurações Gerais" 
        subtitulo="Parâmetros financeiros, regras de negócio e outras definições globais do sistema" 
      />

      <main className="max-w-3xl mt-8">
        <div className="bg-brand-card border border-zinc-350 p-6 shadow-lg space-y-6">
          <div className="border-b border-zinc-300 pb-3">
            <h2 className="text-base font-serif font-bold text-brand-ink">Valores de Referência</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Estes valores são usados automaticamente pelas calculadoras do sistema (como o cálculo de diárias em Recibos).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salario" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Salário Mínimo Nacional (R$)
                </label>
                <input
                  type="number"
                  id="salario"
                  step="0.01"
                  value={salario}
                  onChange={(e) => setSalario(e.target.value)}
                  required
                  className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              <div>
                <label htmlFor="ano" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Ano de Vigência
                </label>
                <input
                  type="number"
                  id="ano"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  required
                  className="w-full bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-xs text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={salvando}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-tinto text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-tinto-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {salvando ? 'Salvando...' : 'Salvar Parâmetros'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AdminPageWrapper>
  )
}
