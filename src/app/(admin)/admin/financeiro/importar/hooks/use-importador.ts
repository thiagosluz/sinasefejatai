import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { parseOFX } from '@/lib/ofx-parser'
import { useModal } from '@/providers/modal-provider'

import { checkExistingTransactions, importTransactions, SaveTransaction } from '../../actions-ofx'
import { ExtendedTransaction } from '../components/importador-table'

export const CATEGORIAS_ENTRADA = [
  'Contribuição de Filiados',
  'Repasse Nacional',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

export const CATEGORIAS_SAIDA = [
  'Tarifas Bancárias',
  'Despesas Administrativas',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas com Viagens',
  'Outros'
]

// Mapeamento automático inteligente de categorias
const sugerirCategoria = (descricao: string, tipo: 'Entrada' | 'Saída'): string => {
  const desc = descricao.toLowerCase()
  
  if (tipo === 'Entrada') {
    if (/rendimento|rend|juros|aplic/i.test(desc)) return 'Rendimentos'
    if (/repasse|nacional|sinasefe/i.test(desc)) return 'Repasse Nacional'
    if (/saldo|abertura|inicial/i.test(desc)) return 'Saldo de Abertura'
    return 'Contribuição de Filiados' // Padrão mais comum
  } else {
    if (/tarifa|cobranca|manutencao|mensal|anuidade/i.test(desc)) return 'Tarifas Bancárias'
    if (/viagem|hosped|transp|combust|aliment|diaria/i.test(desc)) return 'Despesas com Viagens'
    if (/evento|mobiliz|reuniao|paraliz|panf|som/i.test(desc)) return 'Eventos/Mobilizações'
    if (/servico|terc|honor|advoc|contab|advogado|contador/i.test(desc)) return 'Serviços de Terceiros'
    if (/papel|copia|resma|escrit|consumo|pasta|caneta/i.test(desc)) return 'Material de Consumo'
    if (/aluguel|luz|agua|tel|internet|adm|taxa|condominio/i.test(desc)) return 'Despesas Administrativas'
    return 'Outros'
  }
}

export function useImportador() {
  const router = useRouter()
  const { confirm } = useModal()
  
  const [loading, setLoading] = useState(false)
  const [transacoes, setTransacoes] = useState<ExtendedTransaction[]>([])
  const [nomeArquivo, setNomeArquivo] = useState('')

  const processarArquivo = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      toast.error('Por favor, envie um arquivo com extensão .OFX')
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
          toast.error('Não foi possível ler o arquivo. Certifique-se de que ele não está vazio.')
          return
        }

        const parsed = parseOFX(text)
        if (parsed.length === 0) {
          setLoading(false)
          toast.error('Nenhuma transação financeira válida foi encontrada dentro do arquivo OFX.')
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
        toast.error('Erro ao carregar o arquivo.')
      }

      reader.readAsText(file)
    } catch (err) {
      console.error(err)
      setLoading(false)
      toast.error('Ocorreu um erro inesperado ao analisar o extrato.')
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
      toast.error('Por favor, selecione ao menos 1 lançamento para importar.')
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
          toast.success(res.message || 'Lançamentos importados!')
          router.push('/admin/financeiro')
        } else {
          toast.error(res.error)
        }
      } catch (err) {
        console.error(err)
        setLoading(false)
        toast.error('Ocorreu um erro no processamento da importação.')
      }
    }
  }

  const handleLimparExtrato = () => {
    setTransacoes([])
    setNomeArquivo('')
  }

  const totalSelecionadas = transacoes.filter(t => t.selected).length
  const totalValorSelecionadas = transacoes
    .filter(t => t.selected)
    .reduce((sum, t) => sum + (t.tipo === 'Entrada' ? t.valor : -t.valor), 0)

  return {
    state: {
      loading,
      transacoes,
      nomeArquivo,
      totalSelecionadas,
      totalValorSelecionadas
    },
    actions: {
      processarArquivo,
      handleToggleSelect,
      handleToggleAll,
      handleCategoryChange,
      handleImportSubmit,
      handleLimparExtrato
    }
  }
}
