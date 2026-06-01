import { FileCheck, FileX } from 'lucide-react'
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

interface PrestacaoPrintLayoutProps {
  config?: DocumentHeaderConfig | null
  mesAno: string
  obterNomeMesExtenso: (mesAnoStr: string) => string
  saldoAnterior: number
  totalEntradas: number
  totalSaidas: number
  saldoAtual: number
  resumoEntradas: { categoria: string; total: number }[]
  resumoSaidas: { categoria: string; total: number }[]
  transacoesDoMes: Transacao[]
}

export function PrestacaoPrintLayout({
  config,
  mesAno,
  obterNomeMesExtenso,
  saldoAnterior,
  totalEntradas,
  totalSaidas,
  saldoAtual,
  resumoEntradas,
  resumoSaidas,
  transacoesDoMes
}: PrestacaoPrintLayoutProps) {
  return (
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
  )
}
