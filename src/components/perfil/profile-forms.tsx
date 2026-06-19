'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { updatePassword,updateProfile } from '@/app/(admin)/admin/perfil/actions'

interface ProfileBasicFormProps {
  initialName: string
  initialEmail: string
}

export function ProfileBasicForm({ initialName, initialEmail }: ProfileBasicFormProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await updateProfile(formData)
    setLoading(false)

    if (res.success) {
      toast.success(res.message, { duration: 5000 })
    } else {
      toast.error(res.error)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 border-2 border-brand-ink p-6 bg-white shadow-[4px_4px_0px_#121214]">
      <div>
        <h2 className="text-lg font-serif font-bold text-brand-tinto uppercase tracking-tight">
          Dados Básicos
        </h2>
        <p className="text-xs text-zinc-600 mt-1 mb-4">
          Atualize seu nome de exibição e endereço de e-mail.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="nome">
          Nome Completo
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          defaultValue={initialName}
          className="bg-brand-card border border-zinc-400 px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="email">
          Endereço de E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          className="bg-brand-card border border-zinc-400 px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-ink hover:bg-zinc-800 disabled:bg-zinc-400 text-brand-cream font-bold uppercase tracking-wider text-xs py-3.5 px-6 transition-all mt-2 border border-brand-ink shadow-[2px_2px_0px_var(--brand-tinto)] active:scale-98 hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer self-end w-full md:w-auto flex items-center justify-center"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Salvar Alterações'}
      </button>
    </form>
  )
}

export function ProfilePasswordForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await updatePassword(formData)
    setLoading(false)

    if (res.success) {
      toast.success(res.message)
      // Clear form
      const form = document.getElementById('password-form') as HTMLFormElement
      if (form) form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <form id="password-form" action={handleSubmit} className="flex flex-col gap-4 border-2 border-brand-ink p-6 bg-white shadow-[4px_4px_0px_#121214]">
      <div>
        <h2 className="text-lg font-serif font-bold text-brand-tinto uppercase tracking-tight">
          Alterar Senha
        </h2>
        <p className="text-xs text-zinc-600 mt-1 mb-4">
          Digite uma nova senha segura com pelo menos 6 caracteres.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="password">
          Nova Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="bg-brand-card border border-zinc-400 px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif" htmlFor="confirmPassword">
          Confirmar Nova Senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="bg-brand-card border border-zinc-400 px-4 py-3 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto focus:ring-1 focus:ring-brand-tinto transition-colors"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white font-bold uppercase tracking-wider text-xs py-3.5 px-6 transition-all mt-2 border border-brand-tinto shadow-[2px_2px_0px_#121214] active:scale-98 hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer self-end w-full md:w-auto flex items-center justify-center"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Atualizar Senha'}
      </button>
    </form>
  )
}
