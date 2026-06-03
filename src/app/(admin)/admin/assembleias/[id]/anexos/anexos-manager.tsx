'use client'

import { useState } from 'react'
import { Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react'

import { excluirDocumento, salvarDocumentoMetadata } from '@/app/(admin)/admin/assembleias/actions-documentos'
import { formatarDataPtBR } from '@/lib/date-utils'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/providers/modal-provider'

interface Anexo {
  id: string
  nome_arquivo: string
  arquivo_url: string
  tamanho_bytes: number | null
  created_at: string
}

interface AnexosManagerProps {
  assembleiaId: string
  anexosIniciais: Anexo[]
}

export default function AnexosManager({ assembleiaId, anexosIniciais }: AnexosManagerProps) {
  const { alert, confirm } = useModal()
  const [uploading, setUploading] = useState(false)
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_MB = 10
    if (file.size > MAX_MB * 1024 * 1024) {
      await alert(`O arquivo selecionado é muito grande. O tamanho máximo permitido é ${MAX_MB}MB.`)
      e.target.value = ''
      return
    }

    // Pede confirmação ou apenas faz upload com o nome original do arquivo.
    // Usaremos o nome original do arquivo como o nome visível.
    
    try {
      setUploading(true)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `anexo-${assembleiaId}-${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('documentos')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      await salvarDocumentoMetadata(
        assembleiaId,
        'anexo',
        publicUrlData.publicUrl,
        file.name, // Nome original
        file.size
      )

      // Em um cenário sem mutate() global do SWR, usamos useRouter().refresh()
      // mas como a action revalidatePath('/admin/assembleias/[id]/anexos') será chamada,
      // a página será atualizada via Server Actions.
      
    } catch (err: unknown) {
      console.error(err)
      let msg = 'Erro ao anexar o documento. Verifique as permissões.'
      if (err instanceof Error && err.message === 'The object exceeded the maximum allowed size') {
         msg = 'O arquivo excede o limite máximo configurado no servidor.'
      }
      await alert(msg)
    } finally {
      setUploading(false)
      e.target.value = '' // reseta o input
    }
  }

  const handleDelete = async (id: string, arquivo_url: string) => {
    const isConfirmed = await confirm('Tem certeza que deseja excluir este anexo permanentemente?')
    if (!isConfirmed) return

    try {
      await excluirDocumento(id, arquivo_url, assembleiaId)
    } catch (err) {
      console.error(err)
      await alert('Erro ao excluir o documento.')
    }
  }

  return (
    <div>
      {/* Área de Upload */}
      <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-8 text-center mb-8 relative hover:bg-zinc-100 transition-colors">
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileUpload} 
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title="Clique para escolher um PDF"
        />
        <div className="flex flex-col items-center justify-center pointer-events-none">
          {uploading ? (
            <Loader2 size={32} className="text-zinc-400 animate-spin mb-3" />
          ) : (
            <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center mb-3">
              <Plus size={24} className="text-zinc-500" />
            </div>
          )}
          <p className="font-bold text-zinc-700 text-sm">
            {uploading ? 'Enviando arquivo...' : 'Clique ou arraste um PDF aqui para anexar'}
          </p>
          {!uploading && (
            <p className="text-xs text-zinc-500 mt-1">
              O nome original do arquivo será exibido na página pública. Máximo 10MB.
            </p>
          )}
        </div>
      </div>

      {/* Lista de Anexos */}
      {anexosIniciais.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500 italic">Nenhum anexo extra cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anexosIniciais.map((anexo) => (
            <div key={anexo.id} className="flex items-center justify-between p-4 bg-white border border-brand-border hover:border-zinc-400 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-zinc-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-brand-ink text-sm truncate" title={anexo.nome_arquivo}>
                    {anexo.nome_arquivo}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                    Anexado em {formatarDataPtBR(anexo.created_at, { day: '2-digit', month: 'short', year: 'numeric' })}
                    {anexo.tamanho_bytes ? ` • ${(anexo.tamanho_bytes / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <a 
                  href={anexo.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-500 hover:text-brand-ink hover:bg-zinc-100 transition-colors"
                  title="Baixar ou Visualizar"
                >
                  <Download size={16} />
                </a>
                <div className="w-[1px] h-4 bg-zinc-200"></div>
                <button 
                  onClick={() => handleDelete(anexo.id, anexo.arquivo_url)}
                  className="p-2 text-zinc-400 hover:text-brand-tinto hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
