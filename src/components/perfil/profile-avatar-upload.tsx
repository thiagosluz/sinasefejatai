'use client'

import { useRef,useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { updateAvatar } from '@/app/(admin)/admin/perfil/actions'
import { createClient } from '@/lib/supabase/client'

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string
  userName: string
}

export function ProfileAvatarUpload({ currentAvatarUrl, userName }: ProfileAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens.')
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('A imagem deve ter no máximo 2MB.')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Fazendo upload da imagem...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Atualizar o perfil com a Server Action
      const res = await updateAvatar(publicUrl)
      
      if (!res.success) throw new Error(res.error)

      toast.success('Foto de perfil atualizada!', { id: toastId })
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Erro ao fazer upload da imagem.', { id: toastId })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border-2 border-brand-ink bg-brand-cream/50 shadow-[4px_4px_0px_#121214]">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-4 border-brand-ink bg-brand-card flex items-center justify-center overflow-hidden">
          {currentAvatarUrl ? (
            <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-serif font-bold text-brand-tinto">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 bg-brand-ink/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 disabled:bg-brand-ink/80"
        >
          {isUploading ? (
            <Loader2 className="animate-spin mb-1" size={24} />
          ) : (
            <>
              <Camera size={24} className="mb-1" />
              <span className="text-xs font-bold uppercase tracking-wider">Alterar</span>
            </>
          )}
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />

      <div className="text-center">
        <h3 className="font-bold text-brand-ink text-lg">{userName}</h3>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Foto do Perfil</p>
      </div>
    </div>
  )
}
