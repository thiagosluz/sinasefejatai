'use client'

import { useState, useTransition } from 'react'

import { ComboboxFiliados } from '@/components/ui/combobox-filiados'
import { useModal } from '@/providers/modal-provider'

import { convidarUsuario } from '../actions'

interface FiliadoOption {
  id: string
  nome: string
}

interface InviteUserModalProps {
  onClose: () => void
  filiados: FiliadoOption[]
}

export function InviteUserModal({ onClose, filiados }: InviteUserModalProps) {
  const [isPending, startTransition] = useTransition()
  const { alert } = useModal()
  
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('diretoria')
  const [filiadoId, setFiliadoId] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('role', role)
        if (filiadoId) formData.append('filiado_id', filiadoId)

        await convidarUsuario(formData)
        alert('Convite enviado com sucesso!')
        onClose()
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Erro: ${error.message}`)
        } else {
          alert('Falha desconhecida ao convidar.')
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-ink">Convidar Novo Usuário</h2>
        <p className="text-sm text-brand-ink/60 mt-1">
          O usuário receberá um e-mail com um link para definir sua senha de acesso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-brand-ink">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-brand-border bg-white focus:outline-none focus:border-brand-tinto"
            placeholder="email@exemplo.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-brand-ink">Nível de Acesso</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-brand-border bg-white focus:outline-none focus:border-brand-tinto"
          >
            <option value="diretoria">Membro da Diretoria</option>
            <option value="superadmin">Superadministrador</option>
            <option value="filiado">Filiado Comum</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-brand-ink">Vínculo com Filiado (Opcional)</label>
          <ComboboxFiliados 
            filiados={filiados}
            value={filiadoId}
            onChange={setFiliadoId}
            placeholder="Nenhum vínculo (Ex: Contador, Desenvolvedor)"
          />
          <p className="text-xs text-brand-ink/50 mt-1">
            Se for um diretor ou membro do sindicato, vincule o cadastro dele aqui.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-brand-ink/60 hover:text-brand-ink font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-6 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer disabled:opacity-50"
          >
            {isPending ? 'Enviando...' : 'Enviar Convite'}
          </button>
        </div>
      </form>
    </div>
  )
}
