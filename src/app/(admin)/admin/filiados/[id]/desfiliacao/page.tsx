import { notFound } from 'next/navigation'

import DocumentHeader from '@/components/document-header'
import { createClient } from '@/lib/supabase/server'

export default async function DesfiliacaoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params
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


  return (
    <div className="bg-white min-h-screen p-8 print:p-0 text-black font-sans">
      <div className="max-w-[800px] mx-auto border border-zinc-200 p-10 print:border-none print:p-4">
        
        {/* Cabeçalho Institucional Padrão */}
        <DocumentHeader config={config} />

        <h2 className="text-center font-bold text-xl mb-10 underline underline-offset-4">TERMO DE DESFILIAÇÃO</h2>

        <div className="text-sm leading-relaxed text-justify mb-10 space-y-4">
          <p>
            Eu, <strong>{filiado.nome}</strong>, inscrito(a) no CPF sob o nº <strong>{filiado.cpf || '_____________________'}</strong>, 
            e Matrícula SIAPE nº <strong>{filiado.siape || '_________________'}</strong>, lotado(a) no campus/unidade <strong>{filiado.campus || '_____________________'} {filiado.unidade_lotacao ? ` - ${filiado.unidade_lotacao}` : ''}</strong>,
            venho por meio deste documento formalizar o meu pedido de <strong>DESFILIAÇÃO</strong> do SINASEFE Seção Sindical Jataí/GO.
          </p>
          <p>
            Solicito, outrossim, o <strong>cancelamento imediato do desconto da mensalidade sindical</strong> (consignação) incidente sobre a minha folha de pagamento.
          </p>
          <p>
            Declaro ter ciência de que, ao assinar o presente termo, deixo de usufruir de todos os direitos, benefícios e da assistência jurídica prestada pelo sindicato a partir da data de hoje.
          </p>
        </div>

        <div className="text-center mt-20">
          <p className="text-sm mb-16">
            Jataí, _____ de ___________________________ de _________
          </p>

          <div className="border-b border-black w-2/3 mx-auto mb-2"></div>
          <p className="text-sm font-bold uppercase">{filiado.nome}</p>
          <p className="text-xs text-zinc-600 uppercase">CPF: {filiado.cpf || '_____________________'}</p>
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
