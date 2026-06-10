'use client'

import { useState } from 'react'
import { ArrowLeft, FileText,Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { addPublicacao } from '../actions'

export default function NovaPublicacaoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    // Anexar o arquivo manualmente se não for nativamente puxado
    if (file) {
      formData.set('arquivo', file)
    } else {
      toast.error('Por favor, anexe o arquivo PDF da publicação.')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await addPublicacao(formData)
      if (result.success) {
        toast.success('Publicação registrada com sucesso!')
        router.push('/admin/publicacoes')
      } else {
        toast.error(result.error || 'Erro ao registrar publicação.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminPageWrapper>
      <div className="mb-4">
        <Link
          href="/admin/publicacoes"
          className="text-xs uppercase tracking-wider font-bold text-brand-ink/60 hover:text-brand-tinto flex items-center gap-1 w-fit transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para Publicações
        </Link>
      </div>

      <AdminPageHeader
        titulo="Nova Publicação Pública"
        subtitulo="Faça upload de Regimentos, Notas, ou Balanços para o Portal de Transparência"
      />

      <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] mt-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Título do Documento
              </label>
              <input
                type="text"
                name="titulo"
                required
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                placeholder="Ex: Regimento Interno 2026"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Categoria
              </label>
              <select
                name="categoria"
                required
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
              >
                <option value="">-- Selecione uma categoria --</option>
                <option value="Regimento">Regimento Interno</option>
                <option value="Balanço Financeiro">Balanço Financeiro</option>
                <option value="Nota Pública">Nota Pública</option>
                <option value="Ata">Ata de Reunião</option>
                <option value="Relatório">Relatório</option>
                <option value="Outros">Outros Documentos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
              Data da Publicação
            </label>
            <input
              type="date"
              name="data_publicacao"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
              Arquivo PDF (Máx 10MB)
            </label>
            <div className="border-2 border-dashed border-brand-border p-6 bg-brand-cream text-center relative group hover:border-brand-ink transition-colors cursor-pointer">
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0])
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                {file ? (
                  <>
                    <FileText size={32} className="text-brand-tinto" />
                    <span className="text-sm font-medium text-brand-ink">{file.name}</span>
                    <span className="text-xs text-brand-ink/60">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-brand-ink/40 group-hover:text-brand-tinto transition-colors" />
                    <span className="text-sm font-medium text-brand-ink/70">Clique para selecionar ou arraste um PDF aqui</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-brand-border">
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 px-6 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Documento'}
            </button>
          </div>
        </form>
      </div>
    </AdminPageWrapper>
  )
}
