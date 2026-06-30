'use client'

import { useState, useTransition } from 'react'
import { Clock, Power,Save } from 'lucide-react'

import { salvarAniversariosConfig } from '../actions'

interface ConfigFormProps {
  initialConfig: {
    ativo: boolean
    horario: string
  }
}

export default function ConfigAniversarioForm({ initialConfig }: ConfigFormProps) {
  const [ativo, setAtivo] = useState(initialConfig.ativo)
  const [horario, setHorario] = useState(initialConfig.horario)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await salvarAniversariosConfig(ativo, horario)
      if (res.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso no servidor e no QStash!' })
      } else {
        setMessage({ type: 'error', text: res.error || 'Erro ao salvar.' })
      }
      
      setTimeout(() => setMessage(null), 5000)
    })
  }

  return (
    <div className="bg-white border border-brand-border-muted shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1">
        <h3 className="text-brand-ink font-bold text-lg flex items-center gap-2 mb-1">
          <Power size={20} className={ativo ? 'text-brand-olive' : 'text-zinc-400'} />
          Automação de Aniversários
        </h3>
        <p className="text-sm text-zinc-500">
          Quando ativado, o sistema enviará um e-mail de felicitações aos filiados no dia do aniversário deles, de forma automática.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
        
        {/* Toggle Ativo/Inativo */}
        <label className="flex items-center cursor-pointer gap-3">
          <span className="text-sm font-semibold text-brand-ink">
            Status: {ativo ? <span className="text-brand-olive uppercase tracking-wider text-xs">Ligado</span> : <span className="text-zinc-500 uppercase tracking-wider text-xs">Desligado</span>}
          </span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={ativo}
              onChange={() => setAtivo(!ativo)}
            />
            <div className={`block w-14 h-8 rounded-full transition-colors ${ativo ? 'bg-brand-olive' : 'bg-zinc-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${ativo ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>

        <div className="w-px h-8 bg-zinc-300 hidden sm:block"></div>

        {/* Input de Horário */}
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-zinc-500" />
          <input 
            type="time" 
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            disabled={!ativo}
            className="border border-zinc-300 rounded px-2 py-1 text-sm text-brand-ink font-semibold focus:outline-none focus:border-brand-tinto disabled:opacity-50 disabled:bg-zinc-100"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || (ativo === initialConfig.ativo && horario === initialConfig.horario)}
          className="ml-2 bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0px_var(--brand-ink)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          {isPending ? 'Salvando...' : <><Save size={14} /> Salvar</>}
        </button>
      </div>

      {message && (
        <div className={`absolute top-4 right-4 p-4 text-sm font-bold shadow-lg flex items-center gap-2 z-50 ${message.type === 'success' ? 'bg-brand-olive text-white' : 'bg-brand-tinto text-white'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
