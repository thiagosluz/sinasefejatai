'use client'

import { useState } from 'react'
import { PlusCircle, ShieldAlert, Trash2 } from 'lucide-react'

import AdminPageHeader from '@/components/layout/admin-page-header'
import { useModal } from '@/providers/modal-provider'

import { removerAcesso, UsuarioDTO } from '../actions'

import { InviteUserModal } from './invite-user-modal'

interface UsersClientProps {
  usuarios: UsuarioDTO[]
  filiados: { id: string; nome: string }[]
  currentUserRole: string
  currentUserId: string
}

export function UsersClient({ usuarios, filiados, currentUserRole, currentUserId }: UsersClientProps) {
  const { confirm, alert } = useModal()
  const [showInviteModal, setShowInviteModal] = useState(false)

  function handleInvite() {
    if (currentUserRole !== 'superadmin') {
      alert('Apenas superadministradores podem convidar novos usuários.')
      return
    }

    setShowInviteModal(true)
  }

  async function handleRemove(id: string) {
    if (currentUserRole !== 'superadmin') {
      alert('Apenas superadministradores podem remover usuários.')
      return
    }

    const isConfirmed = await confirm('Tem certeza que deseja remover este usuário? Ele não conseguirá mais acessar o painel.')
    
    if (isConfirmed) {
      try {
        await removerAcesso(id)
        alert('Usuário removido com sucesso.')
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Erro ao remover: ${error.message}`)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white p-6 max-w-md w-full shadow-xl">
            <InviteUserModal onClose={() => setShowInviteModal(false)} filiados={filiados} />
          </div>
        </div>
      )}
      
      <AdminPageHeader 
        titulo="Acessos e Permissões" 
        subtitulo="Gerencie quem tem acesso ao painel de administração do sindicato."
      >
        {currentUserRole === 'superadmin' && (
          <button
            onClick={handleInvite}
            className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Convidar Usuário</span>
          </button>
        )}
      </AdminPageHeader>

      {currentUserRole !== 'superadmin' && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200">
          <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Você está visualizando esta lista em modo somente-leitura. Apenas Superadministradores podem adicionar ou remover acessos ao sistema.
          </p>
        </div>
      )}

      <div className="bg-white border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-ink">
            <thead className="bg-brand-cream border-b border-brand-border font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuário / E-mail</th>
                <th className="px-6 py-4">Nível de Acesso</th>
                <th className="px-6 py-4">Filiado Vinculado</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-brand-cream/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                      user.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : user.role === 'diretoria'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-ink/70">
                    {user.filiado ? user.filiado.nome : <span className="text-brand-ink/40 italic">Sem vínculo</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUserRole === 'superadmin' && user.id !== currentUserId && (
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
                        title="Remover Acesso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-brand-ink/50">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
