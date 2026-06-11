'use client'

import { useState } from 'react'
import { Camera,Save, Trash2, UserCircle2 } from 'lucide-react'
import Image from 'next/image'

import { ComboboxFiliados } from '@/components/ui/combobox-filiados'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/providers/modal-provider'

import { excluirCargoExtra,salvarCadeira } from '../actions'

type Membro = {
  id: string
  cargo_nome: string
  nome: string | null
  foto_url: string | null
  is_cargo_fixo: boolean
  filiado_id?: string | null
}

export default function MembroCard({ membro, filiados }: { membro: Membro, filiados: {id: string, nome: string, perfis?: {id: string}[]}[] }) {
  const { alert, confirm } = useModal()
  
  const [cargo, setCargo] = useState(membro.cargo_nome)
  const [nome, setNome] = useState(membro.nome || '')
  const [foto, setFoto] = useState<string | null>(membro.foto_url)
  const [filiadoId, setFiliadoId] = useState<string>(membro.filiado_id || '')
  
  const [criarAcesso, setCriarAcesso] = useState(false)
  const [emailConvite, setEmailConvite] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const selectedFiliadoInfo = filiados.find(f => f.id === filiadoId)
  const hasSystemAccess = selectedFiliadoInfo?.perfis && selectedFiliadoInfo.perfis.length > 0

  // Verifica se teve alterações
  const isDirty = cargo !== membro.cargo_nome || nome !== (membro.nome || '') || foto !== membro.foto_url || filiadoId !== (membro.filiado_id || '') || (criarAcesso && !hasSystemAccess)

  const handleSave = async () => {
    if (!cargo.trim()) {
      await alert('O nome do cargo não pode ficar vazio.')
      return
    }
    
    if (criarAcesso && !emailConvite.trim()) {
      await alert('Para criar um acesso, você precisa informar o e-mail do diretor.')
      return
    }
    
    try {
      setLoading(true)
      await salvarCadeira(membro.id, { 
        cargo_nome: cargo, 
        nome, 
        foto_url: foto, 
        filiado_id: filiadoId || null,
        email_convite: criarAcesso ? emailConvite : undefined
      })
      
      if (criarAcesso) {
        setCriarAcesso(false)
        setEmailConvite('')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar os dados.'
      await alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const isConfirmed = await confirm(`Tem certeza que deseja excluir o cargo extra: "${cargo}"?`)
    if (!isConfirmed) return

    try {
      setLoading(true)
      await excluirCargoExtra(membro.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir cargo.'
      await alert(msg)
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_MB = 5
    if (file.size > MAX_MB * 1024 * 1024) {
      await alert(`A foto é muito grande. O máximo é ${MAX_MB}MB.`)
      return
    }

    try {
      setUploading(true)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `diretoria-${membro.id}-${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('imagens')
        .upload(fileName, file, { upsert: true })

      if (error) {
        throw error
      }

      const { data: publicUrlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(fileName)

      setFoto(publicUrlData.publicUrl)
      
      await salvarCadeira(membro.id, { cargo_nome: cargo, nome, foto_url: publicUrlData.publicUrl, filiado_id: filiadoId || null })

    } catch (err: unknown) {
      console.error(err)
      await alert('Erro ao fazer upload da foto. Verifique se o bucket "imagens" existe e é público no Supabase.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoverFoto = async () => {
    setFoto(null)
    await salvarCadeira(membro.id, { cargo_nome: cargo, nome, foto_url: null, filiado_id: filiadoId || null })
  }

  return (
    <div className={`border bg-white flex flex-col md:flex-row shadow-[3px_3px_0px_var(--brand-ink)] transition-all ${isDirty ? 'border-brand-tinto' : 'border-zinc-300'}`}>
      
      {/* Esquerda: Foto Upload */}
      <div className="w-full md:w-32 bg-zinc-100 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-center items-center p-4 relative group">
        {foto ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-ink">
            <Image 
              src={foto} 
              alt={nome || cargo} 
              fill 
              className="object-cover"
              sizes="96px"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button 
                onClick={handleRemoverFoto}
                className="text-white text-[10px] font-bold uppercase"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center bg-white text-zinc-300">
            {uploading ? (
              <span className="text-[10px] uppercase font-bold animate-pulse text-brand-ink">Enviando</span>
            ) : (
              <UserCircle2 size={40} strokeWidth={1} />
            )}
          </div>
        )}
        
        <label className="mt-3 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors bg-white px-2 py-1 border border-zinc-300">
          <Camera size={12} />
          <span>{foto ? 'Trocar Foto' : 'Adicionar'}</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Direita: Formulário */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Nome do Cargo {membro.is_cargo_fixo && '(Cadeira Obrigatória)'}
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full border border-brand-border bg-white p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
                placeholder="Ex: Coordenadora Geral"
              />
              {membro.is_cargo_fixo && (
                 <p className="text-[10px] text-zinc-400">
                   Você pode flexionar o gênero (ex: Secretário vs Secretária), mas a cadeira permanecerá contabilizada.
                 </p>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Pessoa Eleita (Nome Visível)
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-brand-border bg-white p-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
                placeholder="Nome completo (deixe vazio se vago)"
              />
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Vínculo c/ Filiado
              </label>
              <ComboboxFiliados 
                filiados={filiados}
                value={filiadoId}
                onChange={setFiliadoId}
              />
            </div>
          </div>

          {filiadoId && (
            <div className={`bg-brand-cream/30 border border-brand-tinto/20 p-3 mt-2 ${hasSystemAccess ? 'flex items-center gap-2' : 'space-y-3'}`}>
              {hasSystemAccess ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-brand-olive animate-pulse" />
                  <span className="text-sm font-semibold text-brand-olive">
                    Este filiado já possui acesso ao painel.
                  </span>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={criarAcesso}
                      onChange={(e) => setCriarAcesso(e.target.checked)}
                      className="accent-brand-tinto w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-brand-ink">
                      Criar acesso de sistema para este diretor?
                    </span>
                  </label>
                  
                  {criarAcesso && (
                    <div className="pl-6 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        E-mail para enviar o convite
                      </label>
                      <input
                        type="email"
                        value={emailConvite}
                        onChange={(e) => setEmailConvite(e.target.value)}
                        className="w-full border border-brand-border bg-white p-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-tinto/20 focus:border-brand-tinto transition-colors"
                        placeholder="email@instituicao.edu.br"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        O sistema criará o usuário como membro da diretoria e enviará um link para ele definir a senha.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
          <div>
            {!membro.is_cargo_fixo && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs font-bold uppercase tracking-wider text-brand-tinto hover:text-red-700 flex items-center gap-1 px-2 py-1"
              >
                <Trash2 size={14} /> Excluir Cargo
              </button>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={!isDirty || loading}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_var(--brand-ink)] transition-all ${
              isDirty 
                ? 'bg-brand-olive text-white hover:bg-brand-olive-light hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_var(--brand-ink)]' 
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-70'
            }`}
          >
            <Save size={16} />
            <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
