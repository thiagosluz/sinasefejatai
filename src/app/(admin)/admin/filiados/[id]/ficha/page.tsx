import { notFound } from 'next/navigation'

import DocumentHeader from '@/components/document-header'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function FichaFiliacaoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: filiado, error },
    { data: config }
  ] = await Promise.all([
    supabase.from('filiados').select('*').eq('id', id).single(),
    supabase.from('configuracoes').select('*').eq('id', 1).single()
  ])

  if (error || !filiado) {
    notFound()
  }

  // Formatadores
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="bg-white min-h-screen p-8 print:p-0 text-black font-sans">
      <div className="max-w-[800px] mx-auto border border-zinc-200 p-10 print:border-none print:p-4">
        
        {/* Cabeçalho Institucional Padrão */}
        <DocumentHeader config={config} />

        <h2 className="text-center font-bold text-lg mb-6">FICHA DE FILIAÇÃO</h2>

        {/* --- DADOS DO SERVIDOR --- */}
        <div className="mb-6">
          <div className="bg-zinc-100 border border-black font-bold text-center text-sm py-1 uppercase">
            Dados do Servidor
          </div>
          <div className="border-x border-b border-black text-xs">
            <div className="border-b border-black p-1.5 font-bold">NOME: <span className="font-normal">{filiado.nome}</span></div>
            <div className="flex border-b border-black">
              <div className="flex-1 border-r border-black p-1.5 font-bold">DATA DE NASCIMENTO: <span className="font-normal">{formatDate(filiado.data_nascimento)}</span></div>
              <div className="flex-1 p-1.5 font-bold text-blue-800 underline decoration-blue-800">MATRÍCULA SIAPE: <span className="font-normal text-black no-underline">{filiado.siape}</span></div>
            </div>
            <div className="border-b border-black p-1.5 font-bold">NOME DO PAI: <span className="font-normal">{filiado.nome_pai}</span></div>
            <div className="border-b border-black p-1.5 font-bold">NOME DA MÃE: <span className="font-normal">{filiado.nome_mae}</span></div>
            <div className="flex border-b border-black">
              <div className="flex-1 border-r border-black p-1.5 font-bold">CPF: <span className="font-normal">{filiado.cpf}</span></div>
              <div className="flex-1 p-1.5 font-bold">RG: <span className="font-normal">{filiado.rg}</span></div>
            </div>
            <div className="flex p-1.5 font-bold">
              <div className="w-1/2">CARGO: <span className="font-normal">{filiado.cargo || (filiado.categoria === 'Docente' ? 'Professor EBTT' : 'Técnico Administrativo')}</span></div>
              <div className="w-1/2">LOTAÇÃO: <span className="font-normal">{filiado.campus} - {filiado.unidade_lotacao}</span></div>
            </div>
          </div>
        </div>

        {/* --- DADOS COMPLEMENTARES --- */}
        <div className="mb-6">
          <div className="bg-zinc-100 border border-black font-bold text-center text-sm py-1 uppercase">
            Dados Complementares
          </div>
          <div className="border-x border-b border-black text-xs">
            <div className="border-b border-black p-1.5 font-bold">E-MAIL: <span className="font-normal">{filiado.email}</span></div>
            <div className="flex p-1.5 font-bold">
              <div className="flex-1 border-r border-black">SEXO: <span className="font-normal">{filiado.sexo}</span></div>
              <div className="flex-1 pl-1.5 text-blue-800 underline decoration-blue-800">TELEFONE CELULAR: <span className="font-normal text-black no-underline">{filiado.telefone}</span></div>
            </div>
          </div>
        </div>

        {/* --- ENDEREÇO --- */}
        <div className="mb-10">
          <div className="bg-zinc-100 border border-black font-bold text-center text-sm py-1 uppercase">
            Endereço
          </div>
          <div className="border-x border-b border-black text-xs">
            <div className="border-b border-black p-1.5 font-bold">RUA: <span className="font-normal">{filiado.endereco_rua}</span></div>
            <div className="flex border-b border-black">
              <div className="flex-1 border-r border-black p-1.5 font-bold">BAIRRO: <span className="font-normal">{filiado.endereco_bairro}</span></div>
              <div className="w-1/3 p-1.5 font-bold">CEP: <span className="font-normal">{filiado.endereco_cep}</span></div>
            </div>
            <div className="flex p-1.5 font-bold">
              <div className="flex-1 border-r border-black">CIDADE: <span className="font-normal">{filiado.endereco_cidade}</span></div>
              <div className="w-1/3 pl-1.5">ESTADO: <span className="font-normal">{filiado.endereco_estado}</span></div>
            </div>
          </div>
        </div>

        {/* Termo e Assinatura */}
        <div className="text-sm font-bold mt-12 mb-20 leading-relaxed">
          AUTORIZO DESCONTO DE 1% DO VENCIMENTO POR CONSIGNAÇÃO EM FOLHA DE PAGAMENTO:
        </div>

        <div className="text-center">
          <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
          <p className="text-xs font-bold mb-10">Assinatura</p>

          <p className="text-sm font-bold">
            Jataí, _____ , _______________________________________ , _________
          </p>
        </div>

      </div>

      {/* Script para imprimir automaticamente */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`
        }}
      />
    </div>
  )
}
