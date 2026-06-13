'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { CancelParecerButton } from '@/app/(admin)/admin/documentos/components/cancel-parecer-button'
import { PrestacaoPrintLayout } from '@/app/(admin)/admin/financeiro/prestacao/components/prestacao-print-layout'
import { usePrestacaoMath } from '@/app/(admin)/admin/financeiro/prestacao/hooks/use-prestacao-math'
import { useModal } from '@/providers/modal-provider'

import { aprovarPrestacao,avaliarPrestacao } from '../actions'

export default function ParecerFiscalDetalheCliente({ 
  mesAno, 
  transacoes, 
  config, 
  prestacaoMensal,
  totalConselheiros = 1,
  assinaturasCount = 0,
  jaAssinou = false,
  isConselhoFiscal = false
}: { 
  mesAno: string, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transacoes: any[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prestacaoMensal: any,
  totalConselheiros?: number,
  assinaturasCount?: number,
  jaAssinou?: boolean,
  isConselhoFiscal?: boolean
}) {
  const router = useRouter()
  const { alert, prompt } = useModal()
  const [loading, setLoading] = useState(false)
  const [parecerTexto, setParecerTexto] = useState(prestacaoMensal?.parecer_texto || '')

  const math = usePrestacaoMath(transacoes, mesAno)
  
  const obterNomeMesExtenso = (mesAnoStr: string) => {
    const [ano, mes] = mesAnoStr.split('-')
    const data = new Date(Number(ano), Number(mes) - 1, 15)
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const handleDevolver = async (novoStatus: 'COM_RESSALVAS' | 'REJEITADO') => {
    if (!parecerTexto.trim()) {
      await alert('Você deve preencher o texto do parecer para justificar a devolução ou rejeição.')
      return
    }

    try {
      setLoading(true)
      const res = await avaliarPrestacao(mesAno, parecerTexto, novoStatus)
      if (res.success) {
        await alert(novoStatus === 'COM_RESSALVAS' ? 'Devolvido com ressalvas para correção.' : 'Prestação Rejeitada com sucesso.')
        router.push('/admin/parecer-fiscal')
      } else {
        await alert(res.error || 'Erro ao avaliar prestação.')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      await alert(err.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const handleAprovar = async () => {
    if (!parecerTexto.trim()) {
      await alert('Por favor, redija o parecer de aprovação antes de assinar.')
      return
    }

    const modalMsg = status === 'AGUARDANDO_ASSINATURAS' 
      ? `Atenção: Você está assinando este parecer eletronicamente. Falta(m) ${totalConselheiros! - assinaturasCount!} assinatura(s) para trancar o mês.\n\nDigite sua senha de login para confirmar:`
      : 'Atenção: Ao aprovar esta prestação de contas, o mês será TRANCADO (Hard Lock). O tesoureiro não poderá mais excluir ou editar nenhuma transação deste mês no sistema.\n\nDigite sua senha de login para confirmar e assinar eletronicamente o parecer:'

    // Modal customizado para senha
    const senha = await prompt(
      modalMsg, 
      'Sua senha de login',
      'password'
    )

    if (!senha) return

    try {
      setLoading(true)
      const res = await aprovarPrestacao(mesAno, parecerTexto, senha)
      if (res.success) {
        await alert('Prestação Aprovada, assinada eletronicamente e mês trancado no banco de dados com sucesso!')
        router.push('/admin/parecer-fiscal')
      } else {
        await alert(res.error || 'Erro na aprovação. Verifique sua senha.')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      await alert(err.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const status = prestacaoMensal?.status
  const isAprovado = status === 'APROVADO'
  const isAguardando = status === 'AGUARDANDO_ASSINATURAS'
  const bloqueiaEdicaoTexto = isAprovado || isAguardando || !isConselhoFiscal

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Coluna Esquerda: O relatório do Balancete */}
      <div className="flex-1 bg-white border border-zinc-200 shadow-sm overflow-hidden p-0 relative">
        <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex justify-between items-center text-sm">
          <span className="font-bold uppercase tracking-wider text-zinc-600">Visão da Prestação de Contas</span>
          {isAprovado && (
            <span className="text-green-700 bg-green-100 font-bold px-2 py-1 uppercase text-[10px] tracking-wider rounded">
              Trancado contra edições
            </span>
          )}
        </div>
        <div className="h-[800px] overflow-y-auto bg-brand-cream border-4 border-transparent p-4">
          <div className="scale-[0.85] origin-top bg-white shadow-lg">
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
              parecerTexto={parecerTexto}
            />
          </div>
        </div>
      </div>

      {/* Coluna Direita: O Parecer e Ações */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-white border border-zinc-200 shadow-sm p-6 flex-1 flex flex-col">
          <h3 className="font-serif font-bold text-lg text-brand-ink uppercase tracking-wider mb-2">Parecer Fiscal</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Preencha o parecer baseado nos dados ao lado. Se rejeitado ou com ressalvas, a tesouraria visualizará este texto.
          </p>

          <textarea 
            value={parecerTexto}
            onChange={e => setParecerTexto(e.target.value)}
            disabled={bloqueiaEdicaoTexto || loading}
            placeholder="O Conselho Fiscal, reunido na presente data, analisou as contas do mês..."
            className={`flex-1 w-full border p-3 text-sm focus:outline-none focus:border-brand-tinto resize-none mb-6 ${bloqueiaEdicaoTexto ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'border-zinc-300'}`}
          />

          {(!isAprovado && !isAguardando && isConselhoFiscal) && (
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleDevolver('COM_RESSALVAS')}
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} /> Devolver com Ressalvas
              </button>

              <button 
                onClick={() => handleDevolver('REJEITADO')}
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider border border-brand-tinto text-brand-tinto hover:bg-brand-tinto/10 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> Rejeitar Prestação
              </button>

              <hr className="border-t border-zinc-200 my-2" />

              <button 
                onClick={handleAprovar}
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-serif font-bold uppercase tracking-wider bg-brand-tinto text-white shadow-[3px_3px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Aprovar e Assinar
              </button>
            </div>
          )}

          {(isAguardando && isConselhoFiscal) && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200 p-4 text-center">
                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                <h4 className="font-bold text-amber-800 uppercase tracking-wider text-sm mb-1">Aguardando Assinaturas</h4>
                <p className="text-xs text-amber-700">Progresso: {assinaturasCount} de {totalConselheiros} conselheiros assinaram.</p>
              </div>
              
              {!jaAssinou ? (
                <button 
                  onClick={handleAprovar}
                  disabled={loading}
                  className="w-full py-3 px-4 text-sm font-serif font-bold uppercase tracking-wider bg-brand-tinto text-white shadow-[3px_3px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Assinar Parecer
                </button>
              ) : (
                <div className="text-center p-3 text-xs bg-zinc-100 text-zinc-500 rounded border border-zinc-200">
                  Você já assinou este parecer. O mês será trancado automaticamente quando os demais conselheiros assinarem.
                </div>
              )}
            </div>
          )}

          {isAprovado && (
            <div className="bg-green-50 border border-green-200 p-4 text-center flex flex-col gap-4">
              <div>
                <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
                <h4 className="font-bold text-green-800 uppercase tracking-wider text-sm mb-1">Aprovado e Trancado</h4>
                <p className="text-xs text-green-700">Esta prestação já foi aprovada por todos os conselheiros ({assinaturasCount}/{totalConselheiros}). Nenhuma transação financeira deste mês pode ser alterada.</p>
              </div>

              {prestacaoMensal?.documento_parecer_id && (
                <div className="border-t border-green-200 pt-4 mt-2 text-left">
                  <p className="text-xs text-zinc-600 mb-3">
                    Se foi detectado algum erro formal após o trancamento, um membro do Conselho Fiscal pode cancelar este documento para reabrir a análise:
                  </p>
                  {isConselhoFiscal && <CancelParecerButton id={prestacaoMensal.documento_parecer_id} withText={true} />}
                </div>
              )}
            </div>
          )}
          
          {(!isConselhoFiscal && !isAprovado) && (
             <div className="bg-zinc-50 border border-zinc-200 p-4 text-center mt-auto rounded">
               <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Modo de Acompanhamento</p>
               <p className="text-xs text-zinc-500">Apenas membros do Conselho Fiscal podem avaliar e assinar esta prestação.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
