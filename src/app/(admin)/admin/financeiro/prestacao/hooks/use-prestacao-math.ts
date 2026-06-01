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

export const CATEGORIAS_ENTRADA = [
  'Repasse Nacional',
  'Contribuição de Filiados',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

export const CATEGORIAS_SAIDA = [
  'Despesas com Viagens',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas Administrativas',
  'Tarifas Bancárias',
  'Outros'
]

export function usePrestacaoMath(transacoes: Transacao[], mesAno: string) {
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

  return {
    obterMesPadrao,
    obterMesesOpcoes,
    transacoesDoMes,
    resumoEntradas,
    resumoSaidas,
    totalEntradas,
    totalSaidas,
    saldoAnterior,
    saldoAtual,
  }
}
