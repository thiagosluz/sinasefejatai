'use client'

import { useEffect } from 'react'
import { Calendar,Printer } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { DocumentHeaderConfig } from '@/components/document-header'

import { PrestacaoPrintLayout } from './components/prestacao-print-layout'
import { usePrestacaoMath } from './hooks/use-prestacao-math'

interface Transacao {
  id: string
  tipo: 'Entrada' | 'Saída'
  data: string
  descricao: string
  valor: number
  categoria: string
  comprovante_url: string | null
  created_at: string
}

interface PrestacaoClienteProps {
  transacoes: Transacao[]
  config?: DocumentHeaderConfig | null
}

export default function PrestacaoCliente({ transacoes, config }: PrestacaoClienteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { obterMesPadrao } = usePrestacaoMath(transacoes, '')
  
  // Read from URL, fallback to default month
  const urlMes = searchParams.get('mes')
  const mesAno = urlMes || obterMesPadrao()

  // Injetar o default na URL na primeira carga se estiver vazio
  useEffect(() => {
    if (!urlMes) {
      const defaultMes = obterMesPadrao()
      router.replace(`${pathname}?mes=${defaultMes}`, { scroll: false })
    }
  }, [urlMes, obterMesPadrao, pathname, router])

  const handleMesChange = (novoMes: string) => {
    router.replace(`${pathname}?mes=${novoMes}`, { scroll: false })
  }

  // We re-call the hook with the correct mesAno state for reactive filtering
  const math = usePrestacaoMath(transacoes, mesAno)
  
  // Nome do mês por extenso para o título
  const obterNomeMesExtenso = (mesAnoStr: string) => {
    const [ano, mes] = mesAnoStr.split('-')
    const data = new Date(Number(ano), Number(mes) - 1, 15)
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const mesesOpcoes = math.obterMesesOpcoes()

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-4 md:p-8 print:bg-white print:text-black print:p-0 font-sans selection:bg-brand-tinto selection:text-white">
      
      {/* Barra de Ações (Escondida ao Imprimir) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 print:hidden gap-4">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/admin/financeiro" className="text-zinc-555 hover:text-brand-ink transition-colors font-semibold text-sm">&larr; Livro Caixa</Link>
            <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Prestação de Contas</h1>
          </div>
          <p className="text-zinc-650 text-xs mt-1 uppercase tracking-wider">Demonstrativos Mensais Consolidados Prontos para Impressão</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              value={mesAno}
              onChange={(e) => handleMesChange(e.target.value)}
              className="bg-brand-cream border border-zinc-350 text-brand-ink text-xs px-4 py-2.5 focus:outline-none focus:border-brand-tinto pr-10 cursor-pointer rounded-none font-bold uppercase tracking-wider appearance-none"
            >
              {mesesOpcoes.map(m => (
                <option key={m} value={m}>
                  {obterNomeMesExtenso(m).toUpperCase()}
                </option>
              ))}
            </select>
            <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          <button 
            onClick={() => window.print()}
            className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-2 cursor-pointer"
          >
            <Printer size={15} />
            <span>Imprimir</span>
          </button>
        </div>
      </header>

      {/* Folha de Impressão Oficial A4 isolada */}
      <PrestacaoPrintLayout
        config={config}
        mesAno={mesAno}
        obterNomeMesExtenso={obterNomeMesExtenso}
        saldoAnterior={math.saldoAnterior}
        totalEntradas={math.totalEntradas}
        totalSaidas={math.totalSaidas}
        saldoAtual={math.saldoAtual}
        resumoEntradas={math.resumoEntradas}
        resumoSaidas={math.resumoSaidas}
        transacoesDoMes={math.transacoesDoMes}
      />
    </div>
  )
}
