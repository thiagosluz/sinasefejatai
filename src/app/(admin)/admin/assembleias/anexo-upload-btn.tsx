'use client'

import { useState } from 'react'
import { Upload, Trash2, Eye, Download, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/providers/modal-provider'
import { salvarDocumentoMetadata, excluirDocumento } from './actions-documentos'

interface AnexoUploadBtnProps {
  assembleiaId: string
  tipo: string
  documentoExistente?: {
    id: string
    arquivo_url: string
    nome_arquivo: string
  } | null
  label?: string
}

export default function AnexoUploadBtn({ assembleiaId, tipo, documentoExistente, label = 'Anexar PDF' }: AnexoUploadBtnProps) {
  const { alert, confirm } = useModal()
  const [uploading, setUploading] = useState(false)
  const [deletando, setDeletando] = useState(false)
  
  // Como as listagens de documentos normalmente ficam no cache do Next.js,
  // nós vamos nos apoiar no revalidatePath executado pelas actions,
  // então não precisamos de tanto estado local persistente.

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_MB = 10
    if (file.size > MAX_MB * 1024 * 1024) {
      await alert(`O arquivo selecionado é muito grande. O tamanho máximo permitido é ${MAX_MB}MB.`)
      e.target.value = ''
      return
    }

    try {
      setUploading(true)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${tipo}-${assembleiaId}-${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('documentos')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      // Salva na nova tabela relacional
      await salvarDocumentoMetadata(
        assembleiaId,
        tipo,
        publicUrlData.publicUrl,
        file.name,
        file.size
      )

    } catch (err: unknown) {
      console.error(err)
      let msg = `Erro ao anexar o documento (${tipo}). Verifique permissões.`
      if (err instanceof Error && err.message === 'The object exceeded the maximum allowed size') {
         msg = 'O arquivo excede o limite máximo configurado no servidor.'
      }
      await alert(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!documentoExistente) return
    const isConfirmed = await confirm(`Tem certeza que deseja excluir o PDF de ${tipo}?`)
    if (!isConfirmed) return

    try {
      setDeletando(true)
      await excluirDocumento(documentoExistente.id, documentoExistente.arquivo_url, assembleiaId)
    } catch (err) {
      console.error(err)
      await alert('Erro ao excluir o documento.')
    } finally {
      setDeletando(false)
    }
  }

  if (documentoExistente) {
    return (
      <div className="flex items-center gap-1 bg-brand-olive/10 px-2 py-1 rounded-none border border-brand-olive/30">
        <a
          href={documentoExistente.arquivo_url}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver Documento"
          className="p-1.5 text-brand-olive hover:bg-brand-olive/20 rounded-none transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
        >
          <Eye size={14} />
          <span className="hidden lg:inline">Visualizar</span>
        </a>
        <a
          href={documentoExistente.arquivo_url}
          download
          title="Baixar Documento"
          className="p-1.5 text-brand-olive hover:bg-brand-olive/20 rounded-none transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
        >
          <Download size={14} />
        </a>
        <div className="w-[1px] h-4 bg-brand-olive/30 mx-1"></div>
        <button 
          type="button" 
          onClick={handleDelete} 
          disabled={deletando}
          title="Excluir PDF" 
          className="p-1.5 text-brand-tinto hover:bg-brand-tinto/10 rounded-none transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
        </button>
      </div>
    )
  }

  return (
    <label
      className={`p-2 bg-white border border-brand-border transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer text-brand-ink hover:bg-brand-cream shadow-[1px_1px_0px_var(--brand-ink)] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {uploading ? (
        <span className="animate-pulse flex items-center gap-1"><Sparkles size={14} /> Enviando...</span>
      ) : (
        <>
          <Upload size={14} className="text-amber-600" />
          <span>{label}</span>
        </>
      )}
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileUpload} 
        className="hidden" 
        disabled={uploading} 
      />
    </label>
  )
}
