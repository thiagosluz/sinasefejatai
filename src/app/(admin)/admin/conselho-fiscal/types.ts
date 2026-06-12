export type ConselhoFiscalMembro = {
  id: string
  gestao_id: string
  filiado_id: string | null
  cadeira_referencia: string
  cargo_nome: string
  nome: string | null
  foto_url: string | null
  is_cargo_fixo: boolean
  ordem: number
  criado_em: string
}

export type ConselhoFiscalGestao = {
  id: string
  nome: string
  is_atual: boolean
  criado_em: string
  membros?: ConselhoFiscalMembro[]
}
