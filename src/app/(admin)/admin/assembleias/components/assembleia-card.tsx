import { Calendar, CheckCircle2, Clock, Edit3, MapPin, Trash2,XCircle } from 'lucide-react'
import Link from 'next/link'

import { formatarDataExtenso, formatarHora } from '@/lib/date-utils'

import { Assembleia } from '../types'

interface AssembleiaCardProps {
  assembleia: Assembleia
  onAlterarStatus: (id: string, novoStatus: string) => void
  onDeletarSeguro: (id: string) => void
}

export function AssembleiaCard({ assembleia, onAlterarStatus, onDeletarSeguro }: AssembleiaCardProps) {
  return (
    <div className="bg-brand-card border border-brand-border shadow-[4px_4px_0px_var(--brand-ink)] flex flex-col justify-between group overflow-hidden">
      {/* Tarja de Cancelada (se aplicável) */}
      {assembleia.status === 'Cancelada' && (
        <div className="bg-brand-tinto text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center w-full">
          ASSEMBLEIA CANCELADA
        </div>
      )}
      
      <div className={`p-6 ${assembleia.status === 'Cancelada' ? 'opacity-70' : ''}`}>
        {/* Status e Identificador da Convocatória */}
        <div className="flex items-center justify-between mb-4 border-b border-dashed border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
              assembleia.status === 'Agendada' ? 'bg-blue-100 text-blue-800 border-blue-300' 
              : assembleia.status === 'Rascunho' ? 'bg-orange-100 text-orange-800 border-orange-300'
              : assembleia.status === 'Concluída' ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/30' 
              : 'bg-brand-tinto/10 text-brand-tinto border-brand-tinto/30'
            }`}>
              {assembleia.status}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            {assembleia.numero && (
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/60">
                Edital nº {assembleia.numero}
              </span>
            )}
            {assembleia.versao_edital && assembleia.versao_edital > 1 && (
              <span className="text-[10px] font-bold text-brand-tinto flex items-center gap-1">
                <Edit3 size={10} /> RETIFICADO (V{assembleia.versao_edital})
              </span>
            )}
          </div>
        </div>

        {/* Título Convocatória */}
        <h2 className="text-xl font-serif font-bold text-brand-ink mb-4 group-hover:text-brand-tinto transition-colors">
          Assembleia Geral {assembleia.tipo}
        </h2>

        {/* Infos Detalhadas com Ícones Físicos */}
        <div className="space-y-2.5 mb-6 text-xs text-brand-ink/80">
          <div className="flex items-center gap-2.5">
            <Calendar size={14} className="text-brand-tinto" />
            <span className="font-semibold capitalize">{formatarDataExtenso(assembleia.data_realizacao)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={14} className="text-brand-tinto" />
            <span className="font-medium">1ª Convocação: {formatarHora(assembleia.horario_1a_convocacao)} | 2ª Convocação: {formatarHora(assembleia.horario_2a_convocacao)}</span>
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
              <li key={i} className="font-medium truncate" title={pauta}>{pauta}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Barra de Ações Administrativas Estilo Jornal */}
      <div className="bg-brand-cream border-t border-brand-border p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className={`flex flex-1 items-center gap-2 ${assembleia.status === 'Cancelada' ? 'pointer-events-none opacity-50' : ''}`}>
          {(assembleia.status === 'Rascunho' || assembleia.status === 'Agendada') && (
            <Link 
              href={`/admin/assembleias/${assembleia.id}/editar`}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px] ${
                assembleia.status === 'Agendada' 
                  ? 'bg-brand-tinto/10 hover:bg-brand-tinto/20 border border-brand-tinto text-brand-tinto'
                  : 'bg-amber-100 hover:bg-amber-200 border border-amber-600 text-amber-900'
              }`}
            >
              <Edit3 size={12} /> {assembleia.status === 'Agendada' ? 'Retificar' : 'Editar'}
            </Link>
          )}
          {assembleia.status !== 'Rascunho' && (
            <>
              <Link 
                href={`/admin/assembleias/${assembleia.id}/edital`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Edital
              </Link>
              <Link 
                href={`/admin/assembleias/${assembleia.id}/presenca`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-cream hover:bg-brand-card border border-brand-ink text-brand-ink transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Presença
              </Link>
              <Link 
                href={`/admin/assembleias/${assembleia.id}/ata`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-brand-tinto hover:bg-brand-tinto-light border-transparent text-white transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Ata
              </Link>
              <Link 
                href={`/admin/assembleias/${assembleia.id}/anexos`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-800 hover:bg-zinc-700 border-transparent text-white transition-colors text-[10px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Anexos
              </Link>
            </>
          )}
        </div>
        
        {/* Controles de Máquina de Estado Rápidos */}
        {assembleia.status !== 'Cancelada' && assembleia.status !== 'Rascunho' && (
          <div className="flex sm:flex-col items-stretch sm:items-end gap-2 sm:border-l border-brand-border sm:pl-3">
            {assembleia.status !== 'Concluída' && (
              <button onClick={() => onAlterarStatus(assembleia.id, 'Concluída')} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-brand-olive hover:text-brand-olive-light transition-colors">
                <CheckCircle2 size={12} /> Concluir
              </button>
            )}
            {assembleia.status !== 'Concluída' && (
              <button onClick={() => onAlterarStatus(assembleia.id, 'Cancelada')} className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-brand-tinto hover:text-brand-tinto-light transition-colors">
                <XCircle size={12} /> Cancelar
              </button>
            )}
          </div>
        )}
        
        {/* Deletar Seguro */}
        {assembleia.status === 'Cancelada' && (
          <div className="flex sm:flex-col items-stretch sm:items-end gap-2 sm:border-l border-brand-border sm:pl-3">
            <button onClick={() => onDeletarSeguro(assembleia.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-tinto hover:bg-brand-tinto-light text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-[1.5px_1.5px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]">
              <Trash2 size={12} /> Excluir Permanentemente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
