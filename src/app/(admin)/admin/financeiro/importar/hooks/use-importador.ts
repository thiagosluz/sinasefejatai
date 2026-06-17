import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { parseOFX } from '@/lib/ofx-parser'
import { useModal } from '@/providers/modal-provider'

import { checkExistingTransactions, importTransactions, SaveTransaction } from '../../actions-ofx'
import { CategoriaFinanceira } from '../../types'
import { ExtendedTransaction } from '../components/importador-table'

// Mapeamento automático inteligente de categorias
const sugerirCategoria = (descricao: string, tipo: 'Entrada' | 'Saída', categorias: CategoriaFinanceira[]): string => {
  const desc = descricao.toLowerCase()
  const categoriasDoTipo = categorias.filter(c => c.tipo === tipo)
  
  if (categoriasDoTipo.length === 0) return ''

  // Busca o nome provavel
  let provavel = ''
  if (tipo === 'Entrada') {
    if (/rendimento|rend|juros|aplic/i.test(desc)) provavel = 'Rendimentos'
    else if (/repasse|nacional|sinasefe/i.test(desc)) provavel = 'Repasse Nacional'
    else if (/saldo|abertura|inicial/i.test(desc)) provavel = 'Saldo de Abertura'
    else provavel = 'Contribuição de Filiados'
  } else {
    if (/tarifa|cobranca|manutencao|mensal|anuidade/i.test(desc)) provavel = 'Tarifas Bancárias'
    else if (/viagem|hosped|transp|combust|aliment|diaria/i.test(desc)) provavel = 'Despesas com Viagens'
    else if (/evento|mobiliz|reuniao|paraliz|panf|som/i.test(desc)) provavel = 'Eventos/Mobilizações'
    else if (/servico|terc|honor|advoc|contab|advogado|contador/i.test(desc)) provavel = 'Serviços de Terceiros'
    else if (/papel|copia|resma|escrit|consumo|pasta|caneta/i.test(desc)) provavel = 'Material de Consumo'
    else if (/aluguel|luz|agua|tel|internet|adm|taxa|condominio/i.test(desc)) provavel = 'Despesas Administrativas'
    else provavel = 'Outros'
  }

  const categoriaAchada = categoriasDoTipo.find(c => c.nome.toLowerCase() === provavel.toLowerCase())
  return categoriaAchada ? categoriaAchada.id : categoriasDoTipo[0].id
}

export function useImportador(categoriasAtivas: CategoriaFinanceira[]) {
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
            categoria_id: sugerirCategoria(t.descricao, t.tipo, categoriasAtivas)
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

  const handleCategoryChange = (index: number, catId: string) => {
    const updated = [...transacoes]
    updated[index].categoria_id = catId
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
        categoria_id: t.categoria_id,
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
