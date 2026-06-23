import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

import { createAdminClient } from '@/lib/supabase/admin'

import { AtualizacaoForm } from './atualizacao-form'

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ sucesso?: string }>
}

export default async function AtualizarPage({ params, searchParams }: Props) {
  const { token } = await params
  const { sucesso } = await searchParams
  
  const supabase = createAdminClient()

  // Buscar a solicitação pelo token
  const { data: solicitacao, error } = await supabase
    .from('atualizacoes_cadastrais')
    .select('*, filiados (*)')
    .eq('token', token)
    .single()

  if (error || !solicitacao) {
    return (
      <section className="bg-brand-cream flex-1 py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-brand-tinto" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink font-serif mb-2">Link Inválido</h1>
          <p className="text-zinc-600 mb-6">
            Este link de atualização não existe ou foi digitado incorretamente.
          </p>
          <Link href="/" className="text-brand-tinto hover:underline font-medium">Voltar para o site</Link>
        </div>
      </section>
    )
  }

  // Verifica se expirou
  const expiraEm = new Date(solicitacao.expira_em)
  const agora = new Date()
  
  if (agora > expiraEm) {
    return (
      <section className="bg-brand-cream flex-1 py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink font-serif mb-2">Link Expirado</h1>
          <p className="text-zinc-600 mb-6">
            Este link de atualização expirou. Entre em contato com a secretaria do sindicato para gerar um novo link.
          </p>
          <Link href="/" className="text-brand-tinto hover:underline font-medium">Voltar para o site</Link>
        </div>
      </section>
    )
  }

  // Se sucesso
  if (sucesso === '1') {
    return (
      <section className="bg-brand-cream flex-1 py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink font-serif mb-2">Dados Enviados!</h1>
          <p className="text-zinc-600 leading-relaxed mb-6">
            Sua solicitação de atualização foi enviada e está sob análise da diretoria.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-brand-ink border border-brand-border font-semibold px-7 py-3 rounded-full hover:bg-brand-cream transition-all w-full sm:w-auto justify-center">
            Voltar ao início
          </Link>
        </div>
      </section>
    )
  }

  // Verifica status
  if (solicitacao.status !== 'PENDENTE_ENVIO') {
    let mensagem = 'Sua solicitação de atualização já foi enviada e está em análise pela diretoria.'
    if (solicitacao.status === 'APROVADO') mensagem = 'Sua solicitação de atualização já foi aprovada e seus dados foram atualizados no sistema.'
    if (solicitacao.status === 'REJEITADO') mensagem = 'Sua solicitação anterior foi rejeitada. Por favor, solicite um novo link de atualização.'

    return (
      <section className="bg-brand-cream flex-1 py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink font-serif mb-2">Ação Concluída</h1>
          <p className="text-zinc-600 mb-6">
            {mensagem}
          </p>
          <Link href="/" className="text-brand-tinto hover:underline font-medium">Voltar para o site</Link>
        </div>
      </section>
    )
  }

  // Prepara dados atuais: usa os dados estáticos do momento em que o token foi gerado
  // Isso evita que o filiado veja alterações em tempo real se o admin mudar algo depois.
  const dadosIniciais = solicitacao.dados_atuais

  return (
    <>
      <section
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 45%, #1c1917 100%)' }}
      >
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif mb-4">Atualização Cadastral</h1>
          <p className="text-white/75 text-lg">
            Verifique e corrija os seus dados abaixo.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-brand-border-muted shadow-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-brand-ink font-serif mb-1">Olá, {dadosIniciais.nome?.split(' ')[0]}</h2>
              <p className="text-zinc-500 text-sm">
                Altere apenas o que estiver desatualizado ou incorreto. Os campos CPF e SIAPE são fixos.
              </p>
            </div>

            <AtualizacaoForm token={token} dadosAtuais={dadosIniciais} />
          </div>
        </div>
      </section>
    </>
  )
}
