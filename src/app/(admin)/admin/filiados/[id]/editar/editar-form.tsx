'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { editFiliado } from '../../actions'

export function EditarForm({ filiado }: { filiado: { id: string; nome: string; email?: string; telefone?: string; siape?: string; cargo?: string; ativo?: boolean } }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const updateFiliadoWithId = editFiliado.bind(null, filiado.id)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await updateFiliadoWithId(formData)
    setLoading(false)

    if (res?.success) {
      toast.success('Filiado atualizado com sucesso!')
      router.push('/admin/filiados')
    } else if (res?.error) {
      toast.error(res.error)
    }
  }

  return (
    <form action={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nome Completo */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
            Nome Completo *
          </label>
          <input 
            id="nome"
            name="nome"
            defaultValue={filiado.nome}
            required
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
          />
        </div>

        {/* E-mail */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
            Endereço de E-mail
          </label>
          <input 
            id="email"
            name="email"
            type="email"
            defaultValue={filiado.email || ''}
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
          />
        </div>

        {/* Telefone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefone" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
            Telefone / WhatsApp
          </label>
          <input 
            id="telefone"
            name="telefone"
            defaultValue={filiado.telefone || ''}
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
          />
        </div>

        {/* Matrícula SIAPE */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="siape" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
            Matrícula SIAPE
          </label>
          <input 
            id="siape"
            name="siape"
            defaultValue={filiado.siape || ''}
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
          />
        </div>

        {/* Cargo */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cargo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">
            Cargo / Função
          </label>
          <input 
            id="cargo"
            name="cargo"
            defaultValue={filiado.cargo || ''}
            disabled={loading}
            className="bg-brand-cream border border-zinc-350 rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto disabled:opacity-50"
          />
        </div>
      </div>

      {/* Checkbox Ativo/Inativo */}
      <div className="mt-4 pt-4 border-t border-dashed border-zinc-300 flex items-center gap-3">
        <input 
          type="checkbox" 
          id="ativo" 
          name="ativo" 
          defaultChecked={filiado.ativo}
          disabled={loading}
          className="w-4 h-4 rounded-none border-zinc-400 bg-brand-cream text-brand-tinto focus:ring-brand-tinto cursor-pointer disabled:opacity-50"
        />
        <label htmlFor="ativo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif cursor-pointer">
          Ficha Cadastral Ativa (Filiado com direitos plenos)
        </label>
      </div>

      {/* Ações */}
      <div className="pt-6 mt-2 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row justify-end items-center gap-4">
        <div className="flex gap-3 w-full sm:w-auto">
          <Link 
            href="/admin/filiados"
            className="flex-1 sm:flex-none text-center border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 sm:w-auto bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] disabled:shadow-none hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] disabled:translate-x-0 disabled:translate-y-0 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Ficha \u2192'}
          </button>
        </div>
      </div>
    </form>
  )
}
