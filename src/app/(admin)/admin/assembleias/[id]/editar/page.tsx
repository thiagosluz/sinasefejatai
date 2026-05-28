import Link from 'next/link'
import { editAssembleia } from '../../actions'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditarAssembleiaPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const { id } = await props.params
  const searchParams = await props.searchParams
  
  const supabase = await createClient()
  const { data: assembleia } = await supabase
    .from('assembleias')
    .select('*')
    .eq('id', id)
    .single()

  const { data: locais } = await supabase
    .from('locais')
    .select('*')
    .order('nome_curto')

  if (!assembleia) {
    notFound()
  }

  const editAssembleiaWithId = editAssembleia.bind(null, id)
  const pautasText = assembleia.pautas ? assembleia.pautas.join('\n') : ''

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/assembleias" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Editar Assembleia</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider font-medium">Continuar Edição da Convocatória</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <form action={editAssembleiaWithId} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nº do Edital */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="numero" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Nº do Edital
                </label>
                <input 
                  id="numero"
                  name="numero"
                  defaultValue={assembleia.numero || ''}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                  placeholder="Ex: 001/2026"
                />
              </div>

              {/* Público-Alvo e Tipo da Assembleia */}
              <div className="flex flex-col gap-1.5 md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                    Público Convocado *
                  </label>
                  <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center bg-brand-cream border border-zinc-350 px-4 py-2.5 min-h-[42px]">
                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                      <input type="radio" name="publico_alvo" value="filiados" defaultChecked={!assembleia.publico_alvo || assembleia.publico_alvo === 'filiados'} className="accent-brand-tinto" />
                      <span className="text-sm text-brand-ink">Filiados</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                      <input type="radio" name="publico_alvo" value="servidores" defaultChecked={assembleia.publico_alvo === 'servidores'} className="accent-brand-tinto" />
                      <span className="text-sm text-brand-ink">Todos os Servidores</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tipo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                    Tipo de Assembleia *
                  </label>
                  <select 
                    id="tipo"
                    name="tipo"
                    defaultValue={assembleia.tipo}
                    required
                    className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer"
                  >
                    <option value="Ordinária">Assembleia Geral Ordinária</option>
                    <option value="Extraordinária">Assembleia Geral Extraordinária</option>
                    <option value="Sessão Permanente">Assembleia Geral em Sessão Permanente</option>
                    <option value="Estatutária">Assembleia Geral Estatutária</option>
                    <option value="Eleitoral">Assembleia Geral Eleitoral</option>
                  </select>
                </div>
              </div>

              {/* Data */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="data_realizacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Data de Realização *
                </label>
                <input 
                  id="data_realizacao"
                  name="data_realizacao"
                  type="date"
                  defaultValue={assembleia.data_realizacao}
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Local */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="local" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Local de Encontro *
                </label>
                <select 
                  id="local"
                  name="local"
                  defaultValue={assembleia.local}
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer"
                >
                  <option value="" disabled>Selecione um local...</option>
                  {locais?.map((local) => (
                    <option key={local.id} value={local.texto_completo}>{local.nome_curto}</option>
                  ))}
                  {/* Fallback caso a assembleia use um local antigo que não está mais na tabela */}
                  {!locais?.find(l => l.texto_completo === assembleia.local) && assembleia.local && (
                    <option value={assembleia.local}>{assembleia.local}</option>
                  )}
                </select>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">O texto completo será usado no edital</p>
              </div>

              {/* Horário 1ª Convocação */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="horario_1a_convocacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Horário 1ª Convocação *
                </label>
                <input 
                  id="horario_1a_convocacao"
                  name="horario_1a_convocacao"
                  type="time"
                  defaultValue={assembleia.horario_1a_convocacao}
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Horário 2ª Convocação */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="horario_2a_convocacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Horário 2ª Convocação *
                </label>
                <input 
                  id="horario_2a_convocacao"
                  name="horario_2a_convocacao"
                  type="time"
                  defaultValue={assembleia.horario_2a_convocacao}
                  required
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
                />
              </div>

              {/* Pautas */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="pautas" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
                  Pauta de Deliberações (uma por linha) *
                </label>
                <textarea 
                  id="pautas"
                  name="pautas"
                  defaultValue={pautasText}
                  required
                  rows={4}
                  className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto resize-none font-medium leading-relaxed"
                  placeholder="Informe os pontos de pauta da assembleia..."
                />
              </div>

              {/* Motivo da Retificação (Apenas se já agendada) */}
              {assembleia.status === 'Agendada' && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="motivo_retificacao" className="text-xs font-bold uppercase tracking-wider text-brand-tinto font-serif">
                    Motivo da Retificação (Obrigatório) *
                  </label>
                  <textarea 
                    id="motivo_retificacao"
                    name="motivo_retificacao"
                    required
                    rows={2}
                    className="bg-brand-cream border-2 border-brand-tinto rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto resize-none font-medium leading-relaxed"
                    placeholder="Descreva o que mudou e por que este edital está sendo retificado..."
                  />
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="pt-6 mt-2 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row justify-end items-center gap-4">
              {searchParams.error && (
                <div className="text-brand-tinto text-xs font-bold uppercase tracking-wider flex-1 text-center sm:text-left">
                  {searchParams.error}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link 
                  href="/assembleias"
                  className="text-center border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  Cancelar
                </Link>
                {assembleia.status !== 'Agendada' && (
                  <button 
                    type="submit"
                    name="status"
                    value="Rascunho"
                    className="bg-brand-cream hover:bg-brand-card text-brand-ink border border-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] active:scale-98 cursor-pointer"
                  >
                    Salvar Rascunho
                  </button>
                )}
                <button 
                  type="submit"
                  name="status"
                  value="Agendada"
                  className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] active:scale-98 cursor-pointer"
                >
                  {assembleia.status === 'Agendada' ? 'Confirmar Retificação \u2192' : 'Agendar Oficialmente \u2192'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
