import { getValoresReferencia } from './actions'
import ConfiguracoesGeraisCliente from './configuracoes-gerais-cliente';

export const metadata = {
  title: 'Configurações Gerais | Admin SINASEFE',
}

export default async function ConfiguracoesGeraisPage() {
  const valoresReferencia = await getValoresReferencia()

  return (
    <ConfiguracoesGeraisCliente initialValores={valoresReferencia} />
  )
}
