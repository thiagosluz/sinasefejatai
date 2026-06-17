export interface Transacao {
  id: string
  tipo: 'Entrada' | 'Saída'
  data: string
  descricao: string
  valor: number
  categoria: string
  categoria_id: string
  comprovante_url: string | null
  created_at: string
}

export interface CategoriaFinanceira {
  id: string
  nome: string
  tipo: 'Entrada' | 'Saída'
  ativo: boolean
}
