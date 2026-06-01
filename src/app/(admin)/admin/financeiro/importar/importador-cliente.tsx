'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { parseOFX } from '@/lib/ofx-parser'
import { checkExistingTransactions, importTransactions, SaveTransaction } from '../actions-ofx'
import { useModal } from '@/providers/modal-provider'
import { ImportadorDropzone } from './components/importador-dropzone'
import { ImportadorTable, ExtendedTransaction } from './components/importador-table'

const CATEGORIAS_ENTRADA = [
  'Contribuição de Filiados',
  'Repasse Nacional',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

const CATEGORIAS_SAIDA = [
  'Tarifas Bancárias',
  'Despesas Administrativas',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas com Viagens',
  'Outros'
]

export default function ImportadorCliente() {
  const router = useRouter()
  const { alert, confirm } = useModal()
  
  const [loading, setLoading] = useState(false)
  const [transacoes, setTransacoes] = useState<ExtendedTransaction[]>([])
  const [nomeArquivo, setNomeArquivo] = useState('')

  // Mapeamento automático inteligente de categorias
  const sugerirCategoria = (descricao: string, tipo: 'Entrada' | 'Saída'): string => {
    const desc = descricao.toLowerCase();
    
    if (tipo === 'Entrada') {
      if (/rendimento|rend|juros|aplic/i.test(desc)) return 'Rendimentos';
      if (/repasse|nacional|sinasefe/i.test(desc)) return 'Repasse Nacional';
      if (/saldo|abertura|inicial/i.test(desc)) return 'Saldo de Abertura';
      return 'Contribuição de Filiados'; // Padrão mais comum
    } else {
      if (/tarifa|cobranca|manutencao|mensal|anuidade/i.test(desc)) return 'Tarifas Bancárias';
      if (/viagem|hosped|transp|combust|aliment|diaria/i.test(desc)) return 'Despesas com Viagens';
      if (/evento|mobiliz|reuniao|paraliz|panf|som/i.test(desc)) return 'Eventos/Mobilizações';
      if (/servico|terc|honor|advoc|contab|advogado|contador/i.test(desc)) return 'Serviços de Terceiros';
      if (/papel|copia|resma|escrit|consumo|pasta|caneta/i.test(desc)) return 'Material de Consumo';
      if (/aluguel|luz|agua|tel|internet|adm|taxa|condominio/i.test(desc)) return 'Despesas Administrativas';
      return 'Outros';
    }
  }

  // Leitura e processamento do arquivo
  const processarArquivo = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      await alert('Por favor, envie um arquivo com extensão .OFX')
      return
    }

    setLoading(true)
    setNomeArquivo(file.name)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        if (!text) {
          setLoading(false)
          await alert('Não foi possível ler o arquivo. Certifique-se de que ele não está vazio.')
          return
        }

        const parsed = parseOFX(text)
        if (parsed.length === 0) {
          setLoading(false)
          await alert('Nenhuma transação financeira válida foi encontrada dentro do arquivo OFX.')
          return
        }

        // Consultar banco para verificar duplicidades (FITIDs que já existem)
        const fitids = parsed.map(t => t.id)
        const existentes = await checkExistingTransactions(fitids)

        // Estruturar dados da tabela conciliadora
        const extended: ExtendedTransaction[] = parsed.map(t => {
          const alreadyExists = existentes.includes(t.id)
          return {
            ...t,
            alreadyExists,
            selected: !alreadyExists, // Marcado para importação por padrão se for inédito
            categoria: sugerirCategoria(t.descricao, t.tipo)
          }
        })

        setTransacoes(extended)
        setLoading(false)
      }

      reader.onerror = () => {
        setLoading(false)
        alert('Erro ao carregar o arquivo.')
      }

      reader.readAsText(file)
    } catch (err) {
      console.error(err)
      setLoading(false)
      await alert('Ocorreu um erro inesperado ao analisar o extrato.')
    }
  }

  const handleToggleSelect = (index: number) => {
    const updated = [...transacoes]
    if (updated[index].alreadyExists) return // Bloqueia mudança de já existentes
    updated[index].selected = !updated[index].selected
    setTransacoes(updated)
  }

  const handleToggleAll = (val: boolean) => {
    const updated = transacoes.map(t => ({
      ...t,
      selected: t.alreadyExists ? false : val
    }))
    setTransacoes(updated)
  }

  const handleCategoryChange = (index: number, cat: string) => {
    const updated = [...transacoes]
    updated[index].categoria = cat
    setTransacoes(updated)
  }

  const handleImportSubmit = async () => {
    const selecionadas = transacoes.filter(t => t.selected)
    
    if (selecionadas.length === 0) {
      await alert('Por favor, selecione ao menos 1 lançamento para importar.')
      return
    }

    if (await confirm(`Deseja realmente confirmar a importação de ${selecionadas.length} lançamentos para o Livro Caixa?`)) {
      setLoading(true)
      
      const payload: SaveTransaction[] = selecionadas.map(t => ({
        data: t.data,
        tipo: t.tipo,
        descricao: t.descricao,
        valor: t.valor,
        categoria: t.categoria,
        banco_id: t.id
      }))

      try {
        const res = await importTransactions(payload)
        setLoading(false)
        if (res.success) {
          router.push(`/financeiro?success=${encodeURIComponent(res.message)}`)
        } else {
          await alert(res.message)
        }
      } catch (err) {
        console.error(err)
        setLoading(false)
        await alert('Ocorreu um erro no processamento da importação.')
      }
    }
  }

  // Estatísticas de importação
  const totalSelecionadas = transacoes.filter(t => t.selected).length
  const totalValorSelecionadas = transacoes
    .filter(t => t.selected)
    .reduce((sum, t) => sum + (t.tipo === 'Entrada' ? t.valor : -t.valor), 0)

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div className="print:hidden">
        <Link 
          href="/admin/financeiro" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao Livro Caixa
        </Link>
      </div>

      {transacoes.length === 0 ? (
        <ImportadorDropzone loading={loading} onFileSelected={processarArquivo} />
      ) : (
        <div className="space-y-6">
          {/* Informações Gerais do Arquivo */}
          <div className="bg-brand-card border border-brand-border p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-tinto/10 border border-brand-tinto/20 p-2.5 text-brand-tinto">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-ink/50 uppercase tracking-wider">Arquivo Selecionado</p>
                <h4 className="text-sm font-bold text-brand-ink">{nomeArquivo}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <span className="text-brand-ink/50 block text-[9px]">Lançamentos</span>
                <span>{transacoes.length} encontrados</span>
              </div>
              <div className="w-[1px] h-8 bg-brand-border"></div>
              <div>
                <span className="text-brand-ink/50 block text-[9px]">A Importar</span>
                <span className="text-brand-tinto">{totalSelecionadas} transações</span>
              </div>
              <div className="w-[1px] h-8 bg-brand-border"></div>
              <div>
                <span className="text-brand-ink/50 block text-[9px]">Resultado Líquido</span>
                <span className={totalValorSelecionadas >= 0 ? 'text-brand-olive' : 'text-brand-tinto'}>
                  R$ {totalValorSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <ImportadorTable
            transacoes={transacoes}
            categoriasEntrada={CATEGORIAS_ENTRADA}
            categoriasSaida={CATEGORIAS_SAIDA}
            onToggleAll={handleToggleAll}
            onToggleSelect={handleToggleSelect}
            onCategoryChange={handleCategoryChange}
          />

          {/* Botão e Ações de Finalização */}
          <div className="flex justify-between items-center bg-brand-card border border-brand-border p-4 shadow-md">
            <button
              onClick={() => {
                setTransacoes([])
                setNomeArquivo('')
              }}
              className="border border-brand-tinto hover:bg-brand-cream text-brand-tinto py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0px_var(--brand-tinto)]"
            >
              Excluir Extrato Atual
            </button>

            <button
              onClick={handleImportSubmit}
              disabled={loading || totalSelecionadas === 0}
              className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white py-3 px-6 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2.5px_2.5px_0px_var(--brand-ink)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_var(--brand-ink)] disabled:shadow-none flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Importar {totalSelecionadas} Lançamentos</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
