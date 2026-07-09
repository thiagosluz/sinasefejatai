/**
 * Dados centralizados dos critérios RSC-TAE
 * Baseado no Decreto nº 13.048/2026 — Dados extraídos da calculadora original v2.0
 */

// ── Tipos ──

export interface NivelRSC {
  id: string
  nome: string
  pontos: number
  criterios: number
  qualit: string[] | null
  eq: string
  desc: string
  qualitDesc: string | null
}

export interface ItemRSC {
  req: string
  num: string
  pts: number
  unidade: string
  desc: string
  exemplo: string
}

// ── Níveis RSC ──

export const NIVEIS: NivelRSC[] = [
  {
    id: 'I', nome: 'RSC-PCCTAE I', pontos: 10, criterios: 1, qualit: null,
    eq: 'Ens. Fundamental Completo',
    desc: 'Mínimo de 10 pontos e 1 critério específico.',
    qualitDesc: null,
  },
  {
    id: 'II', nome: 'RSC-PCCTAE II', pontos: 15, criterios: 2, qualit: null,
    eq: 'Ensino Médio',
    desc: 'Mínimo de 15 pontos e 2 critérios específicos.',
    qualitDesc: null,
  },
  {
    id: 'III', nome: 'RSC-PCCTAE III', pontos: 25, criterios: 2, qualit: null,
    eq: 'Graduação',
    desc: 'Mínimo de 25 pontos e 2 critérios específicos.',
    qualitDesc: null,
  },
  {
    id: 'IV', nome: 'RSC-PCCTAE IV', pontos: 30, criterios: 3, qualit: ['II', 'IV', 'V', 'VI'],
    eq: 'Especialização',
    desc: 'Mínimo de 30 pontos e 3 critérios específicos.',
    qualitDesc: '≥1 critério dos Req. II, IV, V ou VI (Art. 3º, incisos II, IV, V ou VI)',
  },
  {
    id: 'V', nome: 'RSC-PCCTAE V', pontos: 52, criterios: 5, qualit: ['IV', 'V', 'VI'],
    eq: 'Mestrado',
    desc: 'Mínimo de 52 pontos e 5 critérios específicos.',
    qualitDesc: '≥1 critério dos Req. IV, V ou VI (Art. 3º, incisos IV, V ou VI)',
  },
  {
    id: 'VI', nome: 'RSC-PCCTAE VI', pontos: 75, criterios: 7, qualit: ['VI'],
    eq: 'Doutorado',
    desc: 'Mínimo de 75 pontos e 7 critérios específicos.',
    qualitDesc: '≥1 critério do Req. VI (Art. 3º, inciso VI)',
  },
]

// ── Itens por Requisito ──

export const ITENS: ItemRSC[] = [
  // ── REQUISITO I ──
  {
    req: 'I', num: '1', pts: 3, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício do mandato como membro de conselhos superiores e conselhos de unidades e órgãos colegiados das instituições federais de ensino.',
    exemplo: 'Ex.: Membro do Conselho Superior (CONSU) — mandato: mar/2021 a mar/2023 — Portaria nº 012/2021 — IFSudeste MG Campus Rio Pomba',
  },
  {
    req: 'I', num: '2', pts: 4.5, unidade: 'Por designação',
    desc: 'Coordenação ou presidência de núcleos, representações, grupos de trabalho ou similares, comissões ou comitês previstos no âmbito da administração pública, regularmente instituídos, ou reconhecidos pelo órgão ou pela entidade.',
    exemplo: 'Ex.: Coordenador da Comissão Permanente de Avaliação de Documentos (CPAD) — Portaria nº 045/2022 — período: jan/2022 a dez/2022',
  },
  {
    req: 'I', num: '3', pts: 3, unidade: 'Por designação',
    desc: 'Participação como membro de núcleos, representações, grupos de trabalho ou similares, comissões ou comitês previstos no âmbito da administração pública, regularmente instituídos.',
    exemplo: 'Ex.: Membro da Comissão de Elaboração do PDI 2023-2027 — Portaria nº 078/2022 — IFSudeste MG Campus Rio Pomba',
  },
  {
    req: 'I', num: '4', pts: 3, unidade: 'Por designação',
    desc: 'Participação como defensor dativo ou como membro de equipe designada em processos de apuração de materialidade e responsabilidade, como sindicância, processo administrativo disciplinar e tomada de contas especial.',
    exemplo: 'Ex.: Membro de comissão de Processo Administrativo Disciplinar (PAD nº 001/2021) — Portaria nº 033/2021 — conclusão em jun/2021',
  },
  {
    req: 'I', num: '5', pts: 4.5, unidade: 'Por designação',
    desc: 'Atuação em atividades de organização, fiscalização, execução de exame de seleção, vestibular ou concursos.',
    exemplo: 'Ex.: Fiscal de sala no Processo Seletivo 2022/1 — Portaria nº 110/2022 — data: 22/01/2022 — Campus Rio Pomba',
  },
  {
    req: 'I', num: '6', pts: 3, unidade: 'Por designação',
    desc: 'Atuação em atividades de elaboração, revisão ou correção de provas de exame de seleção, vestibular ou concursos.',
    exemplo: 'Ex.: Elaboração de questões para o Concurso Público Edital nº 02/2021 — Portaria nº 089/2021 — área: Administração',
  },
  {
    req: 'I', num: '7', pts: 1.5, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de mandato em entidade sindical representativa da categoria.',
    exemplo: 'Ex.: Diretor do SINASEFE — Seção Sindical Rio Pomba — mandato: jan/2021 a dez/2022 — Ata de Eleição de 15/01/2021',
  },
  {
    req: 'I', num: '8', pts: 3, unidade: 'Por designação',
    desc: 'Participação como membro em programas ou projetos de políticas públicas externas à Instituição Federal de Ensino, desde que comprovada a obtenção de resultados institucionais relevantes.',
    exemplo: 'Ex.: Membro do Comitê Regional de Empregabilidade do MTE — Portaria Ministerial nº 234/2020 — período: 2020-2021 — relatório de resultados anexo',
  },
  {
    req: 'I', num: '9', pts: 7.5, unidade: 'Por designação',
    desc: 'Representação legal da Instituição Federal de Ensino junto a órgãos e entidades do Poder Público ou responsabilidade técnica junto a órgãos de fiscalização, controle e regulação.',
    exemplo: 'Ex.: Representante institucional junto ao CREA-MG — Portaria nº 015/2021 — período: mar/2021 a mar/2023',
  },
  {
    req: 'I', num: '10', pts: 4.5, unidade: 'Por produto',
    desc: 'Atuação técnica externa, formalmente autorizada ou reconhecida pela Instituição Federal de Ensino de lotação, em órgãos estatais ou paraestatais, escolas de governo, agências reguladoras ou organismos internacionais, com contribuição ou repercussão institucional.',
    exemplo: 'Ex.: Elaboração de relatório técnico para a ANVISA, mediante autorização institucional — Processo nº 25351.000123/2022 — entregue em ago/2022',
  },

  // ── REQUISITO II ──
  {
    req: 'II', num: '1', pts: 7.5, unidade: 'Por projeto',
    desc: 'Coordenação de projetos institucionais (ensino, pesquisa, extensão, gestão e inovação).',
    exemplo: 'Ex.: Coordenador do Projeto de Extensão "Inclusão Digital Rural" — Edital PROEXT nº 01/2021 — período: mar/2021 a mar/2022',
  },
  {
    req: 'II', num: '2', pts: 4.5, unidade: 'Por projeto',
    desc: 'Participação em atividades técnicas ou especializadas em projetos, incluindo a elaboração de projetos pedagógicos, programas ou ações institucionais (ensino, pesquisa, extensão, gestão e inovação).',
    exemplo: 'Ex.: Membro da equipe técnica do Projeto "Agricultura Sustentável" — Edital PIBEX 2022 — IFSudeste MG Campus Rio Pomba',
  },
  {
    req: 'II', num: '3', pts: 7.5, unidade: 'Por mandato',
    desc: 'Participação em comissão/conselho editorial de livros, revistas, publicações científicas ou outras publicações acadêmicas.',
    exemplo: 'Ex.: Membro do Conselho Editorial da Revista Conexão IFSudeste MG — mandato: jan/2022 a dez/2023 — Portaria nº 056/2022',
  },
  {
    req: 'II', num: '4', pts: 3, unidade: 'Por projeto',
    desc: 'Participação em atividade de cooperação técnica interinstitucional em projetos institucionais.',
    exemplo: 'Ex.: Participação no projeto de cooperação técnica IFSudeste MG/UFV "Gestão Ambiental em IFEs" — Acordo de Cooperação nº 01/2022',
  },
  {
    req: 'II', num: '5', pts: 3, unidade: 'Por designação',
    desc: 'Participação em atividades de orientação, tutoria, preceptoria ou supervisão.',
    exemplo: 'Ex.: Tutor do Programa de Acolhimento e Incentivo à Permanência (PAIP) — Portaria nº 143/2022 — semestre 2022/2',
  },
  {
    req: 'II', num: '6', pts: 3, unidade: 'Por produto',
    desc: 'Participação em atividades de produção/reformulação de material acessível, técnico de referência (manuais, roteiros técnicos).',
    exemplo: 'Ex.: Elaboração do Manual de Procedimentos Administrativos — aprovado pela Direção em 10/05/2022 — 48 páginas',
  },
  {
    req: 'II', num: '7', pts: 3, unidade: 'Por evento',
    desc: 'Participação em atividade de avaliação de trabalho ou atuação como jurado em eventos acadêmicos, científicos, culturais, esportivos e técnicos.',
    exemplo: 'Ex.: Avaliador de trabalhos na Semana de Ciência e Tecnologia 2022 — IFSudeste MG Campus Rio Pomba — out/2022',
  },
  {
    req: 'II', num: '8', pts: 3, unidade: 'Por projeto',
    desc: 'Participação em atividade institucional de produção audiovisual, artística, exposição, podcast ou outras formas de apresentação.',
    exemplo: 'Ex.: Produção do podcast "Gestão em Pauta" — episódios 1-5 — Canal YouTube IFSudeste MG Rio Pomba — 2022',
  },
  {
    req: 'II', num: '9', pts: 1, unidade: 'Por capacitação',
    desc: 'Participação em programas de formação continuada e/ou ações de desenvolvimento de competências, desde que não utilizada para fins de aceleração da promoção na carreira, com carga horária mínima de dez horas.',
    exemplo: 'Ex.: Curso "Gestão de Contratos Administrativos" — ENAP — 40h — certificado em 15/06/2022 — não utilizado para IQ',
  },
  {
    req: 'II', num: '10', pts: 1, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Desempenho de atividade técnica de natureza especializada, com contribuição institucional relevante na área de atuação.',
    exemplo: 'Ex.: Analista de TI responsável pelo sistema SUAP — período: jan/2022 a dez/2022 — Portaria de designação nº 022/2022',
  },
  {
    req: 'II', num: '11', pts: 1, unidade: 'Por evento',
    desc: 'Participação em capacitação, fórum, oficina, workshop e congresso, com carga horária mínima de dez horas, vinculada aos interesses da Instituição Federal de Ensino.',
    exemplo: 'Ex.: Participação no CBTI 2022 — Congresso Brasileiro de Tecnologia da Informação — Belo Horizonte — 20 a 22/09/2022 — 24h',
  },

  // ── REQUISITO III ──
  {
    req: 'III', num: '1', pts: 20, unidade: 'Por prêmio',
    desc: 'Recebimento de premiação de âmbito internacional por projeto implementado na administração pública.',
    exemplo: 'Ex.: Prêmio ONU de Serviço Público — categoria Inovação na Gestão Pública — projeto "Digitalização de Processos Acadêmicos" implementado no Campus Rio Pomba — mai/2022',
  },
  {
    req: 'III', num: '2', pts: 15, unidade: 'Por prêmio',
    desc: 'Recebimento de premiação de âmbito nacional por projeto implementado na administração pública.',
    exemplo: 'Ex.: Prêmio Innovare / Prêmio ENAP de Boas Práticas — projeto "Gestão Eletrônica de Contratos" implementado no Campus Rio Pomba — Portaria MEC nº 456/2022',
  },
  {
    req: 'III', num: '3', pts: 7.5, unidade: 'Por prêmio',
    desc: 'Recebimento de premiação de âmbito local ou institucional, formalmente instituído, por projeto implementado na administração pública.',
    exemplo: 'Ex.: Prêmio Destaque Institucional IFSudeste MG 2022 — projeto "Simplificação de Fluxos do Protocolo" — Resolução CONSU nº 018/2022',
  },

  // ── REQUISITO IV ──
  {
    req: 'IV', num: '1', pts: 4.5, unidade: 'Por sistema',
    desc: 'Atuação diferenciada em atividades de execução/operação, desenvolvimento, colaboração nos sistemas estruturantes da administração pública.',
    exemplo: 'Ex.: Administrador do sistema SIAFI — operação e parametrização de módulos — período: jan/2021 a dez/2022 — Portaria nº 011/2021',
  },
  {
    req: 'IV', num: '2', pts: 3, unidade: 'Por designação',
    desc: 'Elaboração de projeto básico ou de termo de referência, ou participação como membro da equipe de planejamento da contratação.',
    exemplo: 'Ex.: Elaboração do Termo de Referência nº 005/2022 — contratação de serviços de limpeza — Processo nº 23000.001/2022',
  },
  {
    req: 'IV', num: '3', pts: 4.5, unidade: 'Por designação',
    desc: 'Exercício de atividades de gestão ou fiscalização de contratos de aquisição, serviços, convênios e acordos ou instrumentos correlatos.',
    exemplo: 'Ex.: Fiscal do Contrato nº 012/2022 — empresa X Serviços Ltda — Portaria de designação nº 098/2022 — valor: R$ 180.000,00',
  },
  {
    req: 'IV', num: '4', pts: 3, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de atividades relacionadas a licitação e a respectivas excepcionalidades.',
    exemplo: 'Ex.: Pregoeiro Oficial — Portaria nº 007/2022 — período: jan/2022 a dez/2022 — condução de 18 pregões eletrônicos',
  },
  {
    req: 'IV', num: '5', pts: 3, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Participação em atividades de apoio técnico especializado em políticas, programas e ações de promoção na área de saúde humana, animal e ambiente, de acessibilidade ou diversidade.',
    exemplo: 'Ex.: Técnico de referência no Núcleo de Apoio às Pessoas com Necessidades Específicas (NAPNE) — período: 2022 — Portaria nº 034/2022',
  },
  {
    req: 'IV', num: '6', pts: 3, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Atuação tecnicamente qualificada em ambientes ou processos que demandem condições especiais de segurança, cuidado ou conformidade com requisitos legais e regulatórios, desde que não receba adicional de periculosidade ou insalubridade em razão das mesmas condições.',
    exemplo: 'Ex.: Técnico de laboratório de química com manuseio de substâncias controladas, sem percepção de adicional de insalubridade — período: jan/2022 a dez/2022',
  },
  {
    req: 'IV', num: '7', pts: 3, unidade: 'Por designação',
    desc: 'Atuação em sistemas e/ou processos de trabalho institucionais em ensino, pesquisa, extensão, gestão e inovação, desde que não constitua atividade habitual do cargo.',
    exemplo: 'Ex.: Responsável pela implantação do módulo de Biblioteca no SUAP — Portaria nº 055/2021 — concluído em dez/2021 — fora das atribuições habituais do cargo',
  },
  {
    req: 'IV', num: '8', pts: 4.5, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Atuação como responsável por setor ou por unidade, formalmente designado, desde que a designação não gere pagamento de remuneração.',
    exemplo: 'Ex.: Chefe do Setor de Protocolo e Arquivo, designação sem FG/CD — Portaria nº 003/2022 — período: jan/2022 a dez/2022',
  },

  // ── REQUISITO V ──
  {
    req: 'V', num: '1', pts: 9, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Cargo de Direção (CD-02) ou equivalente — como titular.',
    exemplo: 'Ex.: Diretor-Geral do Campus Rio Pomba (CD-02) — titular — Portaria MEC nº 789/2020 — período: jan/2021 a dez/2022',
  },
  {
    req: 'V', num: '1s', pts: 4.5, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Cargo de Direção (CD-02) ou equivalente — como substituto.',
    exemplo: 'Ex.: Diretor-Geral Substituto do Campus Rio Pomba (CD-02) — Portaria nº 102/2021 — período de substituição: jul/2021 a ago/2021',
  },
  {
    req: 'V', num: '2', pts: 7.5, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Cargo de Direção (CD-03 e 04) ou equivalente — como titular.',
    exemplo: 'Ex.: Diretor de Ensino (CD-03) — titular — Portaria nº 201/2021 — período: mar/2021 a mar/2023',
  },
  {
    req: 'V', num: '2s', pts: 3, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Cargo de Direção (CD-03 e 04) ou equivalente — como substituto.',
    exemplo: 'Ex.: Diretor de Administração Substituto (CD-04) — Portaria nº 310/2022 — período de substituição: jan/2022 a fev/2022',
  },
  {
    req: 'V', num: '3', pts: 4.5, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Função Gratificada (FG-01 e 02) ou equivalente — como titular.',
    exemplo: 'Ex.: Coordenador de Contratos (FG-01) — titular — Portaria nº 045/2021 — período: jan/2021 a dez/2022',
  },
  {
    req: 'V', num: '3s', pts: 1.5, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Função Gratificada (FG-01 e 02) ou equivalente — como substituto.',
    exemplo: 'Ex.: Substituto do Coordenador de Registro Acadêmico (FG-02) — Portaria nº 078/2022 — período: jul/2022 a ago/2022',
  },
  {
    req: 'V', num: '4', pts: 3, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Função Gratificada (a partir da FG-03) ou equivalente — como titular.',
    exemplo: 'Ex.: Chefe do Setor de Compras (FG-03) — titular — Portaria nº 019/2022 — período: jan/2022 a dez/2022',
  },
  {
    req: 'V', num: '4s', pts: 1, unidade: 'Por ano ou fração acima de 6 meses',
    desc: 'Exercício de Função Gratificada (a partir da FG-03) ou equivalente — como substituto.',
    exemplo: 'Ex.: Substituto do Chefe do Setor de Patrimônio (FG-04) — Portaria nº 091/2022 — período de substituição: out/2022 a nov/2022',
  },

  // ── REQUISITO VI ──
  {
    req: 'VI', num: '1', pts: 30, unidade: 'Por patente',
    desc: 'Carta patente relacionada aos interesses institucionais.',
    exemplo: 'Ex.: Patente de invenção "Sistema de irrigação automatizado por sensores" — INPI nº BR1020220123456 — concedida em 10/03/2022',
  },
  {
    req: 'VI', num: '2', pts: 25, unidade: 'Por projeto',
    desc: 'Participação relevante no desenvolvimento de protótipos, depósitos e/ou registros de propriedade intelectual ou privilégio de invenção relacionada aos interesses institucionais.',
    exemplo: 'Ex.: Coautor do depósito de patente "Dispositivo de monitoramento de solo" — INPI protocolo nº 018170002345 — depositado em mai/2022',
  },
  {
    req: 'VI', num: '3', pts: 20, unidade: 'Por produto',
    desc: 'Participação em transferência de tecnologia, licenciamento ou exploração de ativo tecnológico, como autor ou inventor relacionada aos interesses institucionais.',
    exemplo: 'Ex.: Licenciamento do software "AgroGestão" para empresa ABC Tecnologia Ltda — Contrato IFSudeste MG/TT nº 001/2022 — mai/2022',
  },
  {
    req: 'VI', num: '4', pts: 15, unidade: 'Por curso',
    desc: 'Conclusão de curso de educação formal superior ao exigido para o ingresso no cargo de que é titular e que não seja utilizado para percepção de Incentivo à Qualificação – IQ.',
    exemplo: 'Ex.: Mestrado em Administração Pública — UFOP — concluído em fev/2022 — diploma nº 000123 — não utilizado para IQ',
  },
  {
    req: 'VI', num: '5', pts: 15, unidade: 'Por produto',
    desc: 'Participação relevante na implantação ou desenvolvimento de produto, projeto, processo, técnica ou tecnologia de interesse institucional.',
    exemplo: 'Ex.: Desenvolvimento e implantação do sistema de gestão de almoxarifado — Portaria nº 067/2021 — implantado em dez/2021',
  },
  {
    req: 'VI', num: '6', pts: 7.5, unidade: 'Por grupo de pesquisa',
    desc: 'Atuação em atividade de liderança ou vice-liderança do grupo de pesquisa ou extensão registrado em órgão ou sistema oficial de reconhecimento institucional.',
    exemplo: 'Ex.: Líder do Grupo de Pesquisa "Gestão e Inovação no Serviço Público" — registrado no CNPq — Diretório nº 0123456789 — desde 2021',
  },
  {
    req: 'VI', num: '7', pts: 3, unidade: 'Por projeto',
    desc: 'Participação como membro em grupo de pesquisa devidamente registrado em órgão ou sistema oficial de reconhecimento institucional.',
    exemplo: 'Ex.: Membro do Grupo de Pesquisa "Tecnologias Educacionais" — CNPq — Diretório nº 9876543210 — período: 2021-2022',
  },
  {
    req: 'VI', num: '8', pts: 7.5, unidade: 'Por projeto',
    desc: 'Aprovação de projeto para a captação de recursos para a Instituição Federal de Ensino.',
    exemplo: 'Ex.: Projeto "Inovação na Gestão Escolar" aprovado pelo CNPq — Edital Universal 2022 — processo nº 409123/2022-5 — R$ 50.000,00',
  },
  {
    req: 'VI', num: '9', pts: 20, unidade: 'Por produto',
    desc: 'Publicação ou organização de livro relacionado aos interesses institucionais (com ISBN e Conselho Editorial).',
    exemplo: 'Ex.: "Gestão Pública no Século XXI" — Editora IFSudeste MG — ISBN 978-85-99999-00-0 — Conselho Editorial aprovado — publicado em 2022',
  },
  {
    req: 'VI', num: '10', pts: 7.5, unidade: 'Por publicação',
    desc: 'Autoria ou coautoria de capítulo de livro, de artigo publicado em revista especializada, jornal científico ou periódico, relacionado aos interesses institucionais.',
    exemplo: 'Ex.: Artigo "Transparência na administração pública federal" — Revista de Administração Pública — v.56, n.2, 2022 — DOI: 10.1590/xxx',
  },
  {
    req: 'VI', num: '11', pts: 4.5, unidade: 'Por produto',
    desc: 'Apresentação de trabalho de interesse institucional em congresso, seminário ou outros eventos.',
    exemplo: 'Ex.: Apresentação oral "Inovação na gestão de contratos" — CONGEAD 2022 — Porto Alegre — set/2022 — certificado de apresentação',
  },
  {
    req: 'VI', num: '12', pts: 4.5, unidade: 'Por produto',
    desc: 'Produção de material técnico, científico, metodológico ou administrativo estruturado que visa à difusão do conhecimento.',
    exemplo: 'Ex.: Produção do Guia de Orientação para Elaboração de TCC — aprovado pela Coordenação Acadêmica em 15/03/2022 — 32 páginas',
  },
  {
    req: 'VI', num: '13', pts: 4.5, unidade: 'Por projeto',
    desc: 'Avaliação do projeto de ensino e/ou pesquisa e/ou extensão e/ou inovação.',
    exemplo: 'Ex.: Avaliador ad hoc de projetos de extensão — Edital PROEXT/IFSudeste MG 2022 — Portaria Reitoria nº 234/2022',
  },
  {
    req: 'VI', num: '14', pts: 3, unidade: 'Por evento',
    desc: 'Participação em atividade de difusão ou apoio à formação institucional (expositor, facilitador, colaborador).',
    exemplo: 'Ex.: Expositor na Semana do Servidor IFSudeste MG 2022 — tema: Gestão de Documentos — 40 participantes — 14/10/2022',
  },
  {
    req: 'VI', num: '15', pts: 4.5, unidade: 'Por curso',
    desc: 'Atuação formalmente autorizada como instrutor, tutor, palestrante, autor de conteúdo técnico ou orientador em ação formativa estruturada de interesse institucional, prevista em plano ou programa de desenvolvimento de pessoas.',
    exemplo: 'Ex.: Instrutor do curso "Licitações e Contratos" — ENAP/IFSudeste MG — 40h — 30 servidores capacitados — jan/2022 — Portaria nº 012/2022 — previsto no PDP institucional',
  },
  {
    req: 'VI', num: '16', pts: 3.5, unidade: 'Por evento',
    desc: 'Atuação na coordenação de congresso, simpósio ou seminário de interesse institucional.',
    exemplo: 'Ex.: Coordenador do I Simpósio de Gestão e Inovação IFSudeste MG Rio Pomba — 120 participantes — out/2022 — Portaria nº 189/2022',
  },
  {
    req: 'VI', num: '17', pts: 4.5, unidade: 'Por evento',
    desc: 'Exercício de atividade de coorientação de trabalho de conclusão de curso em diferentes modalidades de ensino.',
    exemplo: 'Ex.: Coorientador de TCC — aluno: João Silva — tema: "Gestão de Resíduos no Campus" — aprovado em 15/11/2022 — nota 9,5',
  },
  {
    req: 'VI', num: '18', pts: 3, unidade: 'Por produto',
    desc: 'Autoria de obra artística ou cultural registrada com contribuição ou repercussão institucional comprovada.',
    exemplo: 'Ex.: Composição musical "Hino do Campus Rio Pomba" — registro ECAD nº 000123456 — homologado em abr/2022 — uso institucional comprovado',
  },
  {
    req: 'VI', num: '19', pts: 1, unidade: 'Por mês',
    desc: 'Atuação institucional no enfrentamento de situações de surto, epidemia e pandemia.',
    exemplo: 'Ex.: Membro do Comitê de Enfrentamento à COVID-19 do Campus — Portaria nº 001/2020 — período: mar/2020 a dez/2021 — 22 meses',
  },
]

// ── Nomes dos Requisitos ──

export const NOMES_REQ: Record<string, string> = {
  'I': 'Req. I — Grupos de trabalho, comissões, comitês, núcleos e representações (Anexo I)',
  'II': 'Req. II — Projetos institucionais, gestão, ensino, pesquisa, extensão e inovação (Anexo II)',
  'III': 'Req. III — Premiação em evento de reconhecimento público por projetos na administração pública (Anexo III)',
  'IV': 'Req. IV — Responsabilidades técnico-administrativas ou especializadas (Anexo IV)',
  'V': 'Req. V — Funções, cargos de direção e de assessoramento institucionais (Anexo V)',
  'VI': 'Req. VI — Produção, prospecção e difusão de conhecimento científico ou técnico (Anexo VI)',
}

export const NOMES_REQ_CURTO: Record<string, string> = {
  'I': 'Requisito I',
  'II': 'Requisito II',
  'III': 'Requisito III',
  'IV': 'Requisito IV',
  'V': 'Requisito V',
  'VI': 'Requisito VI',
}

// ── Helpers ──

export function isPorAno(item: ItemRSC): boolean {
  return item.unidade.toLowerCase().includes('por ano')
}

export function getItensPorReq(req: string): ItemRSC[] {
  return ITENS.filter(it => it.req === req)
}

export const REQS_ORDENADOS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const
