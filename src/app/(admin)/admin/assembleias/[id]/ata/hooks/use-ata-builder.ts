import { formatarHora } from '@/lib/date-utils'

interface Assembleia {
  id: string
  numero: string | null
  tipo: string
  data_realizacao: string
  horario_1a_convocacao: string
  horario_2a_convocacao: string
  local: string
  pautas: string[]
  status: string
}

type Voto = { aFavor: string, contra: string, abstencoes: string, encaminhamento?: string }
type PautaExtra = { titulo: string, solicitante: string, status: 'aprovada' | 'rejeitada', motivoRecusa?: string }

interface UseAtaBuilderProps {
  assembleia: Assembleia
  votos: Record<number, Voto>
  pautasExtras: PautaExtra[]
  presidente: string
  redator: string
}

export function useAtaBuilder({
  assembleia,
  votos,
  pautasExtras,
  presidente,
  redator
}: UseAtaBuilderProps) {

  const obterDataExtenso = (dataStr: string) => {
    const data = new Date(dataStr + 'T12:00:00')
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]
    const diaMes = data.getDate()
    const mes = meses[data.getMonth()]
    const ano = data.getFullYear()
    return `${diaMes} dias do mês de ${mes} de ${ano}`
  }

  const gerarEsbocoHTML = () => {
    const dataExtenso = obterDataExtenso(assembleia.data_realizacao)
    
    const pautasOficiais = assembleia.pautas || []
    const pautasExtrasAprovadas = pautasExtras.filter(pe => pe.status === 'aprovada')
    const pautasExtrasRejeitadas = pautasExtras.filter(pe => pe.status === 'rejeitada')
    const todasPautasParaDiscussao = [
      ...pautasOficiais,
      ...pautasExtrasAprovadas.map(pe => pe.titulo || 'Pauta não especificada')
    ]

    const pautasResumo = todasPautasParaDiscussao.length > 0
      ? todasPautasParaDiscussao.map((p, index) => `${index + 1}) ${p}`).join('; ')
      : 'pauta não definida'

    // Texto de menção às inclusões na abertura da sessão
    let textoInclusoes = ''
    if (pautasExtrasAprovadas.length > 0 || pautasExtrasRejeitadas.length > 0) {
      const partesInclusao: string[] = []
      pautasExtrasAprovadas.forEach(pe => {
        const solicitante = pe.solicitante || 'a plenária'
        partesInclusao.push(`o(a) filiado(a) <strong>${solicitante}</strong> solicitou ao(à) presidente da mesa a inclusão do ponto de pauta <strong>"${pe.titulo || 'não especificada'}"</strong> na Ordem do Dia, sendo o pedido submetido à apreciação dos presentes e <strong>aprovado</strong>`)
      })
      pautasExtrasRejeitadas.forEach(pe => {
        const solicitante = pe.solicitante || 'a plenária'
        const motivo = pe.motivoRecusa?.trim() ? `, tendo como justificativa: <strong>${pe.motivoRecusa.trim()}</strong>` : ''
        partesInclusao.push(`o(a) filiado(a) <strong>${solicitante}</strong> solicitou ao(à) presidente da mesa a inclusão do ponto de pauta <strong>"${pe.titulo || 'não especificada'}"</strong> na Ordem do Dia, sendo o pedido submetido à apreciação dos presentes e <strong>rejeitado</strong>${motivo}`)
      })
      textoInclusoes = ' Antes de se passar à Ordem do Dia, ' + partesInclusao.join('; ') + '.'
    }

    // Detalhes de discussão de cada pauta (oficiais + extras aprovadas)
    let pautasDetalhes = ''
    if (todasPautasParaDiscussao.length > 0) {
      pautasDetalhes = todasPautasParaDiscussao.map((p, index) => {
        const isExtra = index >= pautasOficiais.length
        const v = votos[index]
        const temVotacao = v && (v.aFavor || v.contra || v.abstencoes)
        let texto = `No <strong>${index + 1}º ponto da pauta (${p})</strong>, `
        if (isExtra) {
          texto += `ponto incluído a pedido da plenária conforme registrado na abertura, `
        }
        texto += `debateu-se amplamente sobre o tema. `

        if (temVotacao) {
          const numFavor = parseInt(v.aFavor) || 0
          const numContra = parseInt(v.contra) || 0
          const numAbsten = parseInt(v.abstencoes) || 0

          if (numFavor > 0 && numContra === 0 && numAbsten === 0) {
            texto += `Colocado em regime de votação, o ponto de pauta foi <strong>aprovado por unanimidade</strong> por todos(as) os(as) presentes.`
          } else if (numContra > 0 && numFavor === 0 && numAbsten === 0) {
            texto += `Colocado em regime de votação, o ponto de pauta foi <strong>rejeitado por unanimidade</strong> por todos(as) os(as) presentes.`
          } else {
            texto += `Colocado em regime de votação, a pauta resultou em: <strong>${numFavor} votos a favor, ${numContra} contra e ${numAbsten} abstenções.</strong>`
          }
        } else {
          texto += `Após esclarecimentos, o ponto foi superado e encaminhado consensualmente pelos(as) presentes.`
        }

        if (v?.encaminhamento && v.encaminhamento.trim() !== '') {
          texto += ` Como encaminhamento, a plenária decidiu: <strong>${v.encaminhamento.trim()}</strong>.`
        }

        return texto
      }).join(' ')
    } else {
      pautasDetalhes = 'Não houve pautas definidas para esta reunião.'
    }

    let textoDirecao = ''
    if (presidente && redator && presidente !== redator) {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${presidente}</strong>, que convidou para secretariar os trabalhos o(a) filiado(a) <strong>${redator}</strong>`
    } else if (presidente && (!redator || presidente === redator)) {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${presidente}</strong>, que também assumiu a função de secretariar os trabalhos`
    } else if (!presidente && redator) {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>${redator}</strong>, que também assumiu a função de secretariar os trabalhos`
    } else {
      textoDirecao = `foi aclamado(a) como presidente da mesa o(a) filiado(a) <strong>____________________</strong>, que convidou para secretariar os trabalhos o(a) filiado(a) <strong>____________________</strong>`
    }

    return `
      <div style="text-align: justify; line-height: 1.6; text-indent: 40px;">
        Aos <strong>${dataExtenso}</strong>, às <strong>${formatarHora(assembleia.horario_1a_convocacao)}</strong> em primeira convocação, e às <strong>${formatarHora(assembleia.horario_2a_convocacao)}</strong> em segunda convocação, reuniu-se no(a) <strong>${assembleia.local}</strong>, a Assembleia Geral <strong>${assembleia.tipo}</strong> dos(as) filiados(as) da Seção Sindical de Jataí do SINASEFE, sob convocação formal expedida pelo Edital número <strong>${assembleia.numero || '_____'}</strong>, com a presença dos(as) servidores(as) técnico-administrativos(as) e docentes constantes da respectiva lista de presença. Para dirigir os trabalhos desta assembleia, ${textoDirecao}. Dando início à reunião, o(a) presidente declarou aberta a assembleia e procedeu-se à leitura da pauta de deliberações, constante dos seguintes pontos: <strong>${pautasResumo}</strong>.${textoInclusoes} Passando-se à ordem do dia: ${pautasDetalhes} E nada mais havendo a tratar, a sessão foi encerrada pelo(a) presidente, da qual eu, na qualidade de secretário(a) dos trabalhos, lavrei a presente ata que, após lida e considerada em conformidade por todos(as) os(as) presentes, será assinada pela coordenação, pela mesa diretora dos trabalhos e pelos(as) demais presentes interessados(as).
      </div>
    `
  }

  return { gerarEsbocoHTML }
}
