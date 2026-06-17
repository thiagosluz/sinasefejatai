'use client'

import { useState } from 'react'
import { ArrowLeft, FileText, Image as ImageIcon, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { salvarBoletim } from '../actions'

interface Boletim {
  id?: string
  titulo: string
  corpo_texto: string
  capa_url: string
  arquivo_pdf_url: string | null
  link_externo: string | null
  data_publicacao: string
  status: string
}

export function BoletimForm({ boletim }: { boletim?: Boletim }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [capaFile, setCapaFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const isEdit = !!boletim

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    if (capaFile) formData.set('capa', capaFile)
    if (pdfFile) formData.set('arquivo_pdf', pdfFile)

    if (isEdit) {
      if (boletim.capa_url) formData.set('capa_url_existente', boletim.capa_url)
      if (boletim.arquivo_pdf_url) formData.set('pdf_url_existente', boletim.arquivo_pdf_url)
    }

    try {
      const result = await salvarBoletim(formData, boletim?.id)
      if (result.success) {
        toast.success(isEdit ? 'Boletim atualizado com sucesso!' : 'Boletim registrado com sucesso!')
        router.push('/admin/boletins')
      } else {
        toast.error(result.error || 'Erro ao salvar boletim.')
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
          href="/admin/boletins"
          className="text-xs uppercase tracking-wider font-bold text-brand-ink/60 hover:text-brand-tinto flex items-center gap-1 w-fit transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para Boletins
        </Link>
      </div>

      <AdminPageHeader
        titulo={isEdit ? "Editar Boletim Semanal" : "Novo Boletim Semanal"}
        subtitulo="Cadastre as edições semanais para divulgação pública."
      />

      <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] mt-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                  Título do Boletim *
                </label>
                <input
                  type="text"
                  name="titulo"
                  required
                  defaultValue={boletim?.titulo || ''}
                  className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                  placeholder="Ex: Boletim Semanal 679"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                    Data da Publicação *
                  </label>
                  <input
                    type="date"
                    name="data_publicacao"
                    required
                    defaultValue={boletim?.data_publicacao || new Date().toISOString().split('T')[0]}
                    className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={boletim?.status || 'Publicado'}
                    className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Publicado">Publicado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                  Corpo do Texto (Pautas) *
                </label>
                <textarea
                  name="corpo_texto"
                  required
                  rows={8}
                  defaultValue={boletim?.corpo_texto || ''}
                  className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                  placeholder="Liste as pautas deste boletim. Ex:&#10;1. Luta pela posse&#10;2. Reunião semanal"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                  Link Externo (Opcional)
                </label>
                <input
                  type="url"
                  name="link_externo"
                  defaultValue={boletim?.link_externo || ''}
                  className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink transition-colors"
                  placeholder="https://sinasefe.org.br/site/boletim..."
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload Capa */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                  Imagem de Capa * {isEdit && '(Deixe vazio para manter atual)'}
                </label>
                <div className="border-2 border-dashed border-brand-border p-4 bg-brand-cream text-center relative group hover:border-brand-ink transition-colors cursor-pointer h-40 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setCapaFile(e.target.files[0])
                      }
                    }}
                    required={!isEdit}
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    {capaFile ? (
                      <>
                        <ImageIcon size={24} className="text-brand-tinto" />
                        <span className="text-xs font-medium text-brand-ink truncate w-40">{capaFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-brand-ink/40 group-hover:text-brand-tinto transition-colors" />
                        <span className="text-xs font-medium text-brand-ink/70 px-2">Clique ou arraste uma imagem (JPG, PNG)</span>
                      </>
                    )}
                  </div>
                </div>
                {isEdit && boletim.capa_url && !capaFile && (
                  <p className="text-xs text-zinc-500 mt-2 truncate">Capa atual: salva no sistema.</p>
                )}
              </div>

              {/* Upload PDF */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                  Arquivo PDF (Opcional) {isEdit && '(Deixe vazio para manter atual)'}
                </label>
                <div className="border-2 border-dashed border-brand-border p-4 bg-brand-cream text-center relative group hover:border-brand-ink transition-colors cursor-pointer h-40 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setPdfFile(e.target.files[0])
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    {pdfFile ? (
                      <>
                        <FileText size={24} className="text-brand-tinto" />
                        <span className="text-xs font-medium text-brand-ink truncate w-40">{pdfFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-brand-ink/40 group-hover:text-brand-tinto transition-colors" />
                        <span className="text-xs font-medium text-brand-ink/70 px-2">Clique ou arraste um PDF</span>
                      </>
                    )}
                  </div>
                </div>
                {isEdit && boletim.arquivo_pdf_url && !pdfFile && (
                  <p className="text-xs text-zinc-500 mt-2 truncate">PDF atual: salvo no sistema.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-brand-border">
            <button
              type="submit"
              disabled={isSubmitting || (!isEdit && !capaFile)}
              className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 px-6 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {isSubmitting ? 'Salvando...' : (isEdit ? 'Atualizar Boletim' : 'Publicar Boletim')}
            </button>
          </div>
        </form>
      </div>
    </AdminPageWrapper>
  )
}
