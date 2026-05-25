import { createClient } from '@/lib/supabase/server'
import { PlusCircle, FileText, Calendar, MapPin, Clock, Printer, FileSignature } from 'lucide-react'
import Link from 'next/link'

export default async function AssembleiasPage() {
  const supabase = await createClient()

  // Buscar assembleias ordenadas por data (mais recentes primeiro)
  const { data: assembleias } = await supabase
    .from('assembleias')
    .select('*')
    .order('data_realizacao', { ascending: false })

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b-2 border-brand-ink pb-6 gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-serif font-bold text-brand-tinto tracking-tight">Atos & Assembleias</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Agendamento e Emissão de Editais, Listas e Atas</p>
        </div>
        <Link 
          href="/assembleias/nova" 
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Agendar Assembleia</span>
        </Link>
      </header>

      {/* Grid de Convocatórias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {!assembleias || assembleias.length === 0 ? (
          <div className="lg:col-span-2 bg-brand-card border border-brand-border p-12 text-center shadow-xl">
            <Calendar className="mx-auto h-12 w-12 text-brand-ink/40 mb-4" />
            <h3 className="text-lg font-serif font-bold text-brand-ink">Nenhuma assembleia agendada ainda</h3>
            <p className="text-zinc-600 text-xs mt-2">Comece agendando uma nova assembleia para lavrar os documentos correspondentes.</p>
          </div>
        ) : (
          assembleias.map((assembleia) => (
            <div key={assembleia.id} className="bg-brand-card border border-brand-border shadow-[4px_4px_0px_var(--brand-ink)] flex flex-col justify-between group">
              <div className="p-6">
                
                {/* Status e Identificador da Convocatória */}
                <div className="flex items-center justify-between mb-4 border-b border-dashed border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      assembleia.status === 'Agendada' 
                        ? 'bg-blue-100 text-blue-800 border-blue-300' 
                        : assembleia.status === 'Realizada' 
                          ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
                          : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
                    }`}>
                      {assembleia.status}
                    </span>
                  </div>
                  {assembleia.numero && (
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">Edital nº {assembleia.numero}</span>
                  )}
                </div>

                {/* Título Convocatória */}
                <h2 className="text-xl font-serif font-bold text-brand-ink mb-4 group-hover:text-brand-tinto transition-colors">
                  Assembleia Geral {assembleia.tipo}
                </h2>

                {/* Infos Detalhadas com Ícones Físicos */}
                <div className="space-y-2.5 mb-6 text-xs text-brand-ink/80">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className="text-brand-tinto" />
                    <span className="font-semibold">{new Date(assembleia.data_realizacao).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} className="text-brand-tinto" />
                    <span className="font-medium">1ª Convocação: {assembleia.horario_1a_convocacao.slice(0, 5)}h | 2ª Convocação: {assembleia.horario_2a_convocacao.slice(0, 5)}h</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-brand-tinto" />
                    <span className="font-medium">{assembleia.local}</span>
                  </div>
                </div>

                {/* Pautas */}
                <div className="border-t border-brand-border pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink/60 mb-2 font-serif">Pauta de Deliberações:</h3>
                  <ul className="list-disc list-inside text-xs text-brand-ink/80 space-y-1">
                    {assembleia.pautas && assembleia.pautas.map((pauta: string, i: number) => (
                      <li key={i} className="font-medium">{pauta}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Barra de Ações Administrativas Estilo Jornal */}
              <div className="bg-brand-cream border-t border-brand-border p-4 flex items-center justify-between gap-4">
                <Link 
                  href={`/assembleias/${assembleia.id}/edital`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-xs font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <FileText size={13} />
                  <span>Edital</span>
                </Link>
                <Link 
                  href={`/assembleias/${assembleia.id}/presenca`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-xs font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <Printer size={13} />
                  <span>Presença</span>
                </Link>
                <Link 
                  href={`/assembleias/${assembleia.id}/ata`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-xs font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <FileSignature size={13} />
                  <span>Redigir Ata</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
