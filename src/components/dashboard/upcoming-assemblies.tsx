import { CalendarRange } from 'lucide-react'
import Link from 'next/link'

interface ProximaAssembleia {
  id: string
  tipo: string
  data_realizacao: string
  status: string
}

interface UpcomingAssembliesProps {
  assembleias: ProximaAssembleia[]
}

export function UpcomingAssemblies({ assembleias }: UpcomingAssembliesProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <CalendarRange size={18} className="text-brand-tinto" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 font-serif">
          Próximas Assembleias
        </h3>
      </div>

      {assembleias.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-brand-ink/40 italic">
          Nenhuma assembleia agendada
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {assembleias.map((a) => {
            const dataObj = new Date(a.data_realizacao + 'T00:00:00')
            const dia = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' })
            const mes = dataObj.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase()

            return (
              <Link
                key={a.id}
                href={`/admin/assembleias/${a.id}/editar`}
                className="flex items-center gap-3 px-3 py-2.5 border border-brand-border hover:bg-brand-cream/80 hover:shadow-[2px_2px_0px_var(--brand-ink)] transition-all group"
              >
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-brand-tinto/10 flex-shrink-0">
                  <span className="font-serif font-black text-sm text-brand-tinto leading-none">
                    {dia}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-brand-ink/60 leading-none mt-0.5">
                    {mes}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-ink uppercase tracking-wider truncate group-hover:text-brand-tinto transition-colors">
                    {a.tipo}
                  </p>
                  <p className="text-[10px] text-brand-ink/50 uppercase tracking-widest mt-0.5">
                    {a.status}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
