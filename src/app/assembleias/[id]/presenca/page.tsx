import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'

export default async function ListaPresencaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Buscar assembleia
  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!assembleia) {
    notFound()
  }

  // Buscar filiados ativos
  const { data: filiados } = await supabase
    .from('filiados')
    .select('nome, siape')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  // Gerar linhas vazias para preenchimento manual (ex: 20 linhas)
  const linhasManuais = Array.from({ length: 20 }, (_, i) => i + 1)

  const dataRealizacao = new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR')

  return (
    <div className="min-h-screen bg-zinc-200 print:bg-white text-zinc-900 font-sans">
      {/* Botões de Ação (Escondidos na Impressão) */}
      <div className="print:hidden bg-zinc-950 p-4 sticky top-0 z-10 shadow-md flex justify-between items-center text-zinc-100">
        <div className="flex items-center gap-4">
          <Link href="/assembleias" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <ArrowLeft size={18} />
            Voltar
          </Link>
          <span className="text-zinc-600">|</span>
          <span className="font-medium">Visualização de Impressão</span>
        </div>
        <button 
          // we will use a client component wrapper or just a little script for print
          // since this is server component, we can't use onClick directly easily without client component
          // Instead of converting the whole page, we can use a tiny inline script
          type="button"
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-2"
        >
          <Printer size={18} />
          <span dangerouslySetInnerHTML={{ __html: `<span onclick="window.print()">Imprimir Lista</span>` }} />
        </button>
      </div>

      {/* Papel (A4 Simulação) */}
      <div className="max-w-[210mm] mx-auto bg-white print:w-full print:max-w-none print:shadow-none shadow-2xl p-[20mm] min-h-[297mm]">
        {/* Cabeçalho Timbrado */}
        <header className="flex flex-col items-center border-b-2 border-emerald-800 pb-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* Logo Placeholder */}
            <div className="w-16 h-16 bg-red-700 text-white flex items-center justify-center font-bold text-2xl rounded shadow-inner">
              S
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-emerald-800 uppercase tracking-tight">SINASEFE</h1>
              <h2 className="text-sm font-semibold text-zinc-700 uppercase">Seção Sindical Jataí - GO</h2>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Sindicato Nacional dos Servidores Federais da Educação Básica, Profissional e Tecnológica
          </p>
        </header>

        {/* Título do Documento */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase underline mb-2">Lista de Presença</h2>
          <h3 className="text-lg font-semibold text-zinc-800">
            Assembleia {assembleia.tipo}
          </h3>
          <p className="text-sm text-zinc-600 mt-2">
            <strong>Data:</strong> {dataRealizacao} &nbsp;|&nbsp; 
            <strong>Local:</strong> {assembleia.local} &nbsp;|&nbsp;
            <strong>1ª Conv:</strong> {assembleia.horario_1a_convocacao.slice(0, 5)} &nbsp;|&nbsp;
            <strong>2ª Conv:</strong> {assembleia.horario_2a_convocacao.slice(0, 5)}
          </p>
        </div>

        {/* Tabela de Filiados Ativos */}
        <table className="w-full text-sm border-collapse mb-8 border border-zinc-400">
          <thead>
            <tr className="bg-zinc-100 print:bg-zinc-100">
              <th className="border border-zinc-400 p-2 text-left w-12 text-center">Nº</th>
              <th className="border border-zinc-400 p-2 text-left">Nome do Filiado</th>
              <th className="border border-zinc-400 p-2 text-left w-32">SIAPE</th>
              <th className="border border-zinc-400 p-2 text-center w-64">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {filiados?.map((filiado, index) => (
              <tr key={index} className="break-inside-avoid">
                <td className="border border-zinc-400 p-2 text-center text-zinc-600">{index + 1}</td>
                <td className="border border-zinc-400 p-2 font-medium">{filiado.nome}</td>
                <td className="border border-zinc-400 p-2 text-zinc-700">{filiado.siape || ''}</td>
                <td className="border border-zinc-400 p-6"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tabela de Preenchimento Manual */}
        <h3 className="text-base font-bold uppercase mb-4 mt-12 break-before-page">Inclusões Manuais / Visitantes</h3>
        <table className="w-full text-sm border-collapse border border-zinc-400">
          <thead>
            <tr className="bg-zinc-100 print:bg-zinc-100">
              <th className="border border-zinc-400 p-2 text-left">Nome</th>
              <th className="border border-zinc-400 p-2 text-left w-32">SIAPE / RG</th>
              <th className="border border-zinc-400 p-2 text-center w-64">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {linhasManuais.map((linha) => (
              <tr key={`manual-${linha}`} className="break-inside-avoid">
                <td className="border border-zinc-400 p-6"></td>
                <td className="border border-zinc-400 p-6"></td>
                <td className="border border-zinc-400 p-6"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
