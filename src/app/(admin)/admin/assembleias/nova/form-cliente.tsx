'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { addAssembleia } from '../actions'

interface FormClienteProps {
  numeroSugerido: string
  locais: { id: string; nome_curto: string; texto_completo: string }[]
}

export default function FormCliente({ numeroSugerido, locais }: FormClienteProps) {
  const [horario1, setHorario1] = useState('')
  const [horario2, setHorario2] = useState('')
  const [horario2Modificado, setHorario2Modificado] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await addAssembleia(formData)
    setLoading(false)

    if (res?.success) {
      toast.success('Assembleia criada com sucesso!')
      router.push('/admin/assembleias')
    } else if (res?.error) {
      toast.error(res.error)
    }
  }

  const handleHorario1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHorario1(val)
    
    // Auto-preencher +15 min apenas se o usuário não alterou manualmente a 2ª conv
    if (!horario2Modificado && val) {
      const [h, m] = val.split(':').map(Number)
      if (!isNaN(h) && !isNaN(m)) {
        const data = new Date()
        data.setHours(h, m + 15, 0)
        const novoH = data.getHours().toString().padStart(2, '0')
        const novoM = data.getMinutes().toString().padStart(2, '0')
        setHorario2(`${novoH}:${novoM}`)
      }
    }
  }

  const handleHorario2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHorario2(e.target.value)
    setHorario2Modificado(true)
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
            defaultValue={numeroSugerido}
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
            placeholder="Ex: 001/2026"
          />
        </div>

        {/* Público-Alvo e Tipo da Assembleia (Mesma linha) */}
        <div className="flex flex-col gap-1.5 md:col-span-2 md:grid md:grid-cols-2 md:gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
              Público Convocado *
            </label>
            <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center bg-brand-cream border border-zinc-350 px-4 py-2.5 min-h-[42px]">
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <input type="radio" name="publico_alvo" value="filiados" defaultChecked disabled={loading} className="accent-brand-tinto disabled:opacity-50" />
                <span className="text-sm text-brand-ink">Filiados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <input type="radio" name="publico_alvo" value="servidores" disabled={loading} className="accent-brand-tinto disabled:opacity-50" />
                <span className="text-sm text-brand-ink">Todos os Servidores</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
              Tipo da Assembleia *
            </label>
            <select 
              id="tipo"
              name="tipo"
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
            required
            defaultValue=""
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer disabled:opacity-50"
          >
            <option value="" disabled>Selecione um local...</option>
            {locais.map((local) => (
              <option key={local.id} value={local.texto_completo}>{local.nome_curto}</option>
            ))}
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
            value={horario1}
            onChange={handleHorario1Change}
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
            value={horario2}
            onChange={handleHorario2Change}
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
            required
            rows={4}
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto resize-none font-medium leading-relaxed disabled:opacity-50"
            placeholder="Informe os pontos de pauta da assembleia..."
          />
        </div>
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
          <button 
            type="submit"
            name="status"
            value="Rascunho"
            disabled={loading}
            className="bg-brand-cream hover:bg-brand-card disabled:bg-zinc-200 text-brand-ink border border-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] disabled:shadow-none active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button 
            type="submit"
            name="status"
            value="Agendada"
            disabled={loading}
            className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] disabled:shadow-none active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Agendando...' : 'Agendar Oficialmente \u2192'}
          </button>
        </div>
      </div>
    </form>
  )
}
