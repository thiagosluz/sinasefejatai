import { Cake } from 'lucide-react'

interface Aniversariante {
  id: string
  nome: string
  dia: number
}

interface BirthdayPanelProps {
  aniversariantes: Aniversariante[]
  mesNome: string
}

export function BirthdayPanel({ aniversariantes, mesNome }: BirthdayPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Cake size={18} className="text-brand-tinto" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/60 font-serif">
          Aniversariantes de {mesNome}
        </h3>
      </div>

      {aniversariantes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-brand-ink/40 italic">
          Nenhum aniversariante este mês
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-72 space-y-1 no-scrollbar">
          {aniversariantes.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-brand-cream/80 transition-colors border-b border-dashed border-brand-border last:border-b-0"
            >
              <span className="font-serif font-black text-lg text-brand-tinto w-8 text-center flex-shrink-0">
                {String(a.dia).padStart(2, '0')}
              </span>
              <span className="text-xs text-brand-ink truncate">{a.nome}</span>
            </div>
          ))}
        </div>
      )}

      {aniversariantes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-brand-border text-center">
          <span className="text-[10px] text-brand-ink/50 uppercase tracking-widest">
            {aniversariantes.length} aniversariante{aniversariantes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
