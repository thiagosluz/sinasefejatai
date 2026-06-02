'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { editAssembleia } from '../../actions'

interface EditarFormProps {
  assembleia: {
    id: string;
    numero: string;
    publico_alvo?: string;
    tipo: string;
    data_realizacao: string;
    local: string;
    horario_1a_convocacao: string;
    horario_2a_convocacao: string;
    pautas?: string[];
    status?: string;
  }
  locais: { id: string; nome_curto: string; texto_completo: string }[]
}

export function EditarForm({ assembleia, locais }: EditarFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const pautasText = assembleia.pautas ? assembleia.pautas.join('\n') : ''
  const editAssembleiaWithId = editAssembleia.bind(null, assembleia.id)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await editAssembleiaWithId(formData)
    setLoading(false)

    if (res?.success) {
      toast.success('Assembleia atualizada com sucesso!')
      router.push('/admin/assembleias')
    } else if (res?.error) {
      toast.error(res.error)
    }
  }

  return (
    <form action={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
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
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
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
                <input type="radio" name="publico_alvo" value="filiados" defaultChecked={!assembleia.publico_alvo || assembleia.publico_alvo === 'filiados'} disabled={loading} className="accent-brand-tinto disabled:opacity-50" />
                <span className="text-sm text-brand-ink">Filiados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <input type="radio" name="publico_alvo" value="servidores" defaultChecked={assembleia.publico_alvo === 'servidores'} disabled={loading} className="accent-brand-tinto disabled:opacity-50" />
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
              disabled={loading}
              className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer disabled:opacity-50"
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
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
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
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer disabled:opacity-50"
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
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
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
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
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
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto resize-none font-medium leading-relaxed disabled:opacity-50"
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
              disabled={loading}
              className="bg-brand-cream border-2 border-brand-tinto rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto resize-none font-medium leading-relaxed disabled:opacity-50"
              placeholder="Descreva o que mudou e por que este edital está sendo retificado..."
            />
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="pt-6 mt-2 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row justify-end items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link 
            href="/admin/assembleias"
            className="text-center border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            Cancelar
          </Link>
          {assembleia.status !== 'Agendada' && (
            <button 
              type="submit"
              name="status"
              value="Rascunho"
              disabled={loading}
              className="bg-brand-cream hover:bg-brand-card disabled:bg-zinc-200 text-brand-ink border border-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] disabled:shadow-none active:scale-98 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
          )}
          <button 
            type="submit"
            name="status"
            value="Agendada"
            disabled={loading}
            className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] disabled:shadow-none active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (assembleia.status === 'Agendada' ? 'Confirmar Retificação \u2192' : 'Agendar Oficialmente \u2192')}
          </button>
        </div>
      </div>
    </form>
  )
}
