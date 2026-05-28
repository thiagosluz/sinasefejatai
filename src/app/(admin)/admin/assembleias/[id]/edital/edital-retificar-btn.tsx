import Link from 'next/link'
import { Edit3 } from 'lucide-react'

export default function EditalRetificarBtn({ id, versaoAtual, status }: { id: string, versaoAtual: number, status: string }) {
  if (status !== 'Agendada') return null

  return (
    <Link
      href={`/admin/assembleias/${id}/editar`}
      className="bg-brand-tinto hover:bg-brand-tinto-light text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-2 text-sm"
    >
      <Edit3 size={16} />
      <span>Retificar (v{versaoAtual + 1})</span>
    </Link>
  )
}
