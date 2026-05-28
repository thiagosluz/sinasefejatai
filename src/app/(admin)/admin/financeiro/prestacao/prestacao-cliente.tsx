'use client'

import { useState } from 'react'
import { Printer, Calendar, FileCheck, FileX } from 'lucide-react'
import Link from 'next/link'
import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'

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

const CATEGORIAS_ENTRADA = [
  'Repasse Nacional',
  'Contribuição de Filiados',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

const CATEGORIAS_SAIDA = [
  'Despesas com Viagens',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas Administrativas',
  'Tarifas Bancárias',
  'Outros'
]

export default function PrestacaoCliente({ transacoes, config }: PrestacaoClienteProps) {
  // Obter o mês atual ou o mais recente nas transações no formato YYYY-MM
  const obterMesPadrao = () => {
    if (transacoes.length === 0) {
      const hoje = new Date()
      return `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}`
    }
    const datas = transacoes.map(t => t.data)
    datas.sort()
    const maisRecente = datas[datas.length - 1]
    return maisRecente.slice(0, 7) // Pega apenas YYYY-MM
  }

  const [mesAno, setMesAno] = useState(obterMesPadrao())

  // Filtrar transações para o mês selecionado
  const transacoesDoMes = transacoes.filter(t => t.data.startsWith(mesAno))

  // Agrupar e somar por categorias de entrada
  const resumoEntradas = CATEGORIAS_ENTRADA.map(cat => {
    const total = transacoesDoMes
      .filter(t => t.tipo === 'Entrada' && t.categoria === cat)
      .reduce((sum, t) => sum + Number(t.valor), 0)
    return { categoria: cat, total }
  }).filter(item => item.total > 0) // Mostra apenas categorias que tiveram movimentação

  // Agrupar e somar por categorias de saída
  const resumoSaidas = CATEGORIAS_SAIDA.map(cat => {
    const total = transacoesDoMes
      .filter(t => t.tipo === 'Saída' && t.categoria === cat)
      .reduce((sum, t) => sum + Number(t.valor), 0)
    return { categoria: cat, total }
  }).filter(item => item.total > 0)

  // Totais
  const totalEntradas = transacoesDoMes
    .filter(t => t.tipo === 'Entrada')
    .reduce((sum, t) => sum + Number(t.valor), 0)

  const totalSaidas = transacoesDoMes
    .filter(t => t.tipo === 'Saída')
    .reduce((sum, t) => sum + Number(t.valor), 0)

  const saldoAnterior = transacoes
    .filter(t => t.data < `${mesAno}-01`)
    .reduce((sum, t) => {
      return t.tipo === 'Entrada' ? sum + Number(t.valor) : sum - Number(t.valor)
    }, 0)

  const saldoAtual = saldoAnterior + totalEntradas - totalSaidas

  // Nome do mês por extenso para o título
  const obterNomeMesExtenso = (mesAnoStr: string) => {
    const [ano, mes] = mesAnoStr.split('-')
    const data = new Date(Number(ano), Number(mes) - 1, 15)
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  // Obter meses únicos disponíveis que possuem lançamentos para facilitar o seletor
  const obterMesesOpcoes = () => {
    const meses = transacoes.map(t => t.data.slice(0, 7))
    // Adicionar mês atual caso esteja vazio
    if (meses.length === 0) {
      const hoje = new Date()
      meses.push(`${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}`)
    }
    const unicos = Array.from(new Set(meses))
    unicos.sort().reverse() // Mais recentes primeiro
    return unicos
  }

  const mesesOpcoes = obterMesesOpcoes()

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
              onChange={(e) => setMesAno(e.target.value)}
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

      {/* Folha de Impressão Oficial A4 */}
      <main className="bg-white text-black p-12 max-w-[800px] mx-auto shadow-2xl font-serif text-sm leading-relaxed print:shadow-none print:p-0 print:max-w-none">
        
        {/* Timbre do SINASEFE Jataí Dinâmico */}
        <DocumentHeader config={config} />

        {/* Título */}
        <div className="text-center font-bold text-base uppercase tracking-wider mb-6">
          DEMONSTRATIVO DE PRESTAÇÃO DE CONTAS - MENSAL<br />
          <span className="text-sm font-semibold">REFERÊNCIA: {obterNomeMesExtenso(mesAno).toUpperCase()}</span>
        </div>

        {/* Quadro de Saldos Gerais */}
        <div className="mb-6">
          <table className="w-full border border-black border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold uppercase">
                <th className="py-2 px-4 text-left border-r border-black">Histórico de Saldos</th>
                <th className="py-2 px-4 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="py-2 px-4 border-r border-black font-semibold">SALDO DO MÊS ANTERIOR (Abertura):</td>
                <td className="py-2 px-4 text-right">
                  R$ {saldoAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-black text-emerald-700">
                <td className="py-2 px-4 border-r border-black font-semibold">(+) TOTAL DE RECEITAS (Entradas do Período):</td>
                <td className="py-2 px-4 text-right font-bold">
                  R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b border-black text-red-700">
                <td className="py-2 px-4 border-r border-black font-semibold">(-) TOTAL DE DESPESAS (Saídas do Período):</td>
                <td className="py-2 px-4 text-right font-bold">
                  R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-gray-50 font-bold text-sm">
                <td className="py-2.5 px-4 border-r border-black">SALDO CONSOLIDADO DO MÊS (Fechamento):</td>
                <td className="py-2.5 px-4 text-right">
                  R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quadro Consolidado por Categorias */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          {/* Receitas */}
          <div className="border border-black flex flex-col justify-between">
            <div>
              <div className="bg-gray-150 border-b border-black py-2 px-3 text-xs font-bold uppercase text-center">
                Consolidado de Receitas
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black bg-gray-50 text-[10px] font-bold uppercase">
                    <th className="py-1.5 px-2 text-left border-r border-black">Categoria</th>
                    <th className="py-1.5 px-2 text-right">Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resumoEntradas.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-gray-500 italic">Sem receitas no mês.</td>
                    </tr>
                  ) : (
                    resumoEntradas.map(item => (
                      <tr key={item.categoria}>
                        <td className="py-1.5 px-2 border-r border-black font-medium">{item.categoria}</td>
                        <td className="py-1.5 px-2 text-right">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-black bg-gray-50 font-bold text-[11px] py-2 px-3 flex justify-between">
              <span>TOTAL RECEITAS:</span>
              <span>R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Despesas */}
          <div className="border border-black flex flex-col justify-between">
            <div>
              <div className="bg-gray-150 border-b border-black py-2 px-3 text-xs font-bold uppercase text-center">
                Consolidado de Despesas
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black bg-gray-50 text-[10px] font-bold uppercase">
                    <th className="py-1.5 px-2 text-left border-r border-black">Categoria</th>
                    <th className="py-1.5 px-2 text-right">Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resumoSaidas.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-gray-500 italic">Sem despesas no mês.</td>
                    </tr>
                  ) : (
                    resumoSaidas.map(item => (
                      <tr key={item.categoria}>
                        <td className="py-1.5 px-2 border-r border-black font-medium">{item.categoria}</td>
                        <td className="py-1.5 px-2 text-right">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-black bg-gray-50 font-bold text-[11px] py-2 px-3 flex justify-between">
              <span>TOTAL DESPESAS:</span>
              <span>R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Detalhamento Cronológico das Transações */}
        <div className="mb-8">
          <div className="font-bold text-xs uppercase mb-2 border-b border-black pb-1">
            Detalhamento Cronológico dos Lançamentos do Mês
          </div>
          <table className="w-full border border-black border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold uppercase text-left">
                <th className="py-1.5 px-2 border-r border-black w-[70px]">Data</th>
                <th className="py-1.5 px-2 border-r border-black">Descrição / Histórico</th>
                <th className="py-1.5 px-2 border-r border-black">Categoria</th>
                <th className="py-1.5 px-2 border-r border-black w-[50px] text-center">Tipo</th>
                <th className="py-1.5 px-2 border-r border-black w-[50px] text-center">Recibo</th>
                <th className="py-1.5 px-2 text-right w-[85px]">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {transacoesDoMes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                    Nenhum lançamento registrado neste mês.
                  </td>
                </tr>
              ) : (
                transacoesDoMes.map(t => (
                  <tr key={t.id}>
                    <td className="py-1.5 px-2 border-r border-black">
                      {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-1.5 px-2 border-r border-black truncate max-w-[200px]" title={t.descricao}>
                      {t.descricao}
                    </td>
                    <td className="py-1.5 px-2 border-r border-black uppercase text-[9px] font-semibold">
                      {t.categoria}
                    </td>
                    <td className="py-1.5 px-2 border-r border-black text-center font-bold">
                      {t.tipo === 'Entrada' ? 'ENT' : 'SAÍ'}
                    </td>
                    <td className="py-1.5 px-2 border-r border-black text-center font-semibold">
                      {t.comprovante_url ? (
                        <span className="text-emerald-700 flex items-center justify-center gap-0.5">
                          <FileCheck size={10} /> Sim
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center justify-center gap-0.5">
                          <FileX size={10} /> Não
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-right font-semibold">
                      {t.tipo === 'Entrada' ? '+' : '-'} R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Parecer do Conselho Fiscal e Assinaturas */}
        <div className="mt-12 text-xs">
          <div className="border border-black p-4 mb-10 bg-gray-50 leading-relaxed text-justify">
            <strong>PARECER DO CONSELHO FISCAL:</strong> O Conselho Fiscal da Seção Sindical Jataí do SINASEFE, no uso de suas atribuições regimentais, após minuciosa análise dos lançamentos financeiros, receitas consolidadas, despesas efetuadas e respectivos comprovantes de recebimento e pagamento em anexo referentes ao mês de <strong>{obterNomeMesExtenso(mesAno)}</strong>, manifesta parecer pela <strong>[  ] APROVAÇÃO  [  ] REJEIÇÃO</strong> das presentes contas, considerando-as conformes com as normas financeiras vigentes.
          </div>

          <div className="grid grid-cols-2 gap-8 text-center mt-12">
            {/* Assinatura Coordenação Financeira */}
            <div className="flex flex-col items-center justify-end min-h-[90px]">
              <div className="w-[200px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">Coordenação Financeira</div>
              <div className="text-[10px] text-gray-600 mt-0.5">SINASEFE - Seção Sindical Jataí</div>
            </div>

            {/* Assinatura Conselho Fiscal */}
            <div className="flex flex-col items-center justify-end min-h-[90px]">
              <div className="w-[200px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">Conselho Fiscal - Membro 1</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Assinatura do Conselheiro</div>
            </div>

            {/* Membros Adicionais */}
            <div className="flex flex-col items-center justify-end min-h-[90px] mt-4">
              <div className="w-[200px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">Conselho Fiscal - Membro 2</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Assinatura do Conselheiro</div>
            </div>

            <div className="flex flex-col items-center justify-end min-h-[90px] mt-4">
              <div className="w-[200px] border-b border-black mb-2"></div>
              <div className="font-semibold uppercase">Conselho Fiscal - Membro 3</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Assinatura do Conselheiro</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
