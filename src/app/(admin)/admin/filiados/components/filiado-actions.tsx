'use client'

import { useEffect,useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Edit2, FileCheck2,FileText, MoreVertical, Printer, Trash2, Upload, UserCheck, UserMinus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { aprovarPedido, deleteFicha,desfiliar, uploadFicha } from '../actions'

export default function FiliadoActions({ filiado }: { filiado: { id: string; nome: string; email?: string; telefone?: string; siape?: string; cargo?: string; ativo?: boolean; data_nascimento?: string; nome_pai?: string; nome_mae?: string; cpf?: string; rg?: string; sexo?: string; endereco_rua?: string; endereco_bairro?: string; endereco_cep?: string; endereco_cidade?: string; endereco_estado?: string; unidade_lotacao?: string; campus?: string; categoria?: string; situacao?: string; status_filiacao?: string; arquivo_ficha_filiacao?: string; arquivo_ficha_desfiliacao?: string } }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDesfiliarOpen, setIsDesfiliarOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [uploadTipo, setUploadTipo] = useState<'filiacao' | 'desfiliacao'>('filiacao')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right - window.scrollX,
      })
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleAprovar = async () => {
    setIsSubmitting(true)
    const res = await aprovarPedido(filiado.id)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success('Pedido aprovado com sucesso!')
      setIsOpen(false)
    } else {
      toast.error(res?.error || 'Erro ao aprovar.')
    }
  }

  const handleDesfiliar = async () => {
    setIsSubmitting(true)
    const res = await desfiliar(filiado.id)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success('Filiado marcado como desfiliado.')
      setIsDesfiliarOpen(false)
      setIsOpen(false)
    } else {
      toast.error(res?.error || 'Erro ao desfiliar.')
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.append('tipo', uploadTipo)
    
    const res = await uploadFicha(filiado.id, formData)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success('Arquivo anexado com sucesso!')
      setIsUploadOpen(false)
      setSelectedFile(null)
      setIsOpen(false)
    } else {
      toast.error(res?.error || 'Erro ao fazer upload.')
    }
  }

  const handleDeleteFile = async () => {
    setIsSubmitting(true)
    const res = await deleteFicha(filiado.id, uploadTipo)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success('Anexo removido com sucesso!')
      setIsDeleteOpen(false)
      setIsOpen(false)
    } else {
      toast.error(res?.error || 'Erro ao remover anexo.')
    }
  }

  return (
    <>
      <button 
        onClick={handleToggle}
        className="p-1.5 rounded hover:bg-zinc-200 text-zinc-600 transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          className="absolute mt-1 w-56 bg-white border border-zinc-200 shadow-xl z-[9999] text-sm py-1"
        >
          {/* Editar */}
          <Link href={`/admin/filiados/${filiado.id}/editar`} className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-zinc-700">
            <Edit2 size={15} /> Editar Cadastro
          </Link>

          {/* Aprovar (se pendente) */}
          {filiado.status_filiacao === 'pendente' && (
            <button onClick={handleAprovar} disabled={isSubmitting} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-700">
              <UserCheck size={15} /> Aprovar Pedido
            </button>
          )}

          {/* Imprimir Ficha de Filiação */}
          <Link href={`/admin/filiados/${filiado.id}/ficha`} target="_blank" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-zinc-700 border-t border-zinc-100">
            <Printer size={15} /> Imprimir Ficha
          </Link>

          {/* Anexar Ficha de Filiação */}
          <button onClick={() => { setUploadTipo('filiacao'); setIsUploadOpen(true) }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-zinc-700">
            <Upload size={15} /> Anexar Ficha
          </button>
          
          {/* Visualizar e Excluir Anexo se existir */}
          {filiado.arquivo_ficha_filiacao && (
            <div className="flex flex-col bg-zinc-50 border-t border-zinc-100">
              <a href={filiado.arquivo_ficha_filiacao} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-700 text-xs">
                <FileText size={13} /> Ver Ficha Anexada
              </a>
              <button onClick={() => { setUploadTipo('filiacao'); setIsDeleteOpen(true) }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-xs">
                <Trash2 size={13} /> Excluir Anexo
              </button>
            </div>
          )}

          <div className="border-t border-zinc-100 my-1"></div>

          {/* Imprimir Desfiliação */}
          <Link href={`/admin/filiados/${filiado.id}/desfiliacao`} target="_blank" className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-zinc-700">
            <Printer size={15} /> Imprimir Desfiliação
          </Link>

          {/* Anexar Desfiliação */}
          <button onClick={() => { setUploadTipo('desfiliacao'); setIsUploadOpen(true) }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-zinc-700">
            <Upload size={15} /> Anexar Desfiliação
          </button>

          {/* Visualizar e Excluir Anexo Desfiliação se existir */}
          {filiado.arquivo_ficha_desfiliacao && (
            <div className="flex flex-col bg-zinc-50 border-t border-zinc-100">
              <a href={filiado.arquivo_ficha_desfiliacao} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-700 text-xs">
                <FileText size={13} /> Ver Desfiliação Anexada
              </a>
              <button onClick={() => { setUploadTipo('desfiliacao'); setIsDeleteOpen(true) }} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-xs">
                <Trash2 size={13} /> Excluir Anexo
              </button>
            </div>
          )}

          {/* Solicitar Desfiliação */}
          {filiado.ativo && (
            <button onClick={() => setIsDesfiliarOpen(true)} className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 border-t border-zinc-100">
              <UserMinus size={15} /> Solicitar Desfiliação
            </button>
          )}
        </div>,
        document.body
      )}

      {/* MODAL UPLOAD */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 whitespace-normal">
          <div className="bg-white p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold font-serif mb-2 text-brand-tinto">
              Anexar Ficha de {uploadTipo === 'filiacao' ? 'Filiação' : 'Desfiliação'}
            </h3>
            <p className="text-sm text-zinc-600 mb-6">Selecione o arquivo em PDF ou Imagem com a assinatura para anexar ao cadastro.</p>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-8 hover:bg-zinc-50 transition-colors text-center cursor-pointer group">
                <input 
                  type="file" 
                  name="file" 
                  accept=".pdf,image/*" 
                  required 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {selectedFile ? (
                    <>
                      <FileCheck2 className="w-8 h-8 text-green-600" />
                      <p className="text-sm font-semibold text-zinc-700">{selectedFile.name}</p>
                      <p className="text-xs text-green-600 font-bold">Arquivo selecionado!</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-400 group-hover:text-brand-tinto transition-colors" />
                      <p className="text-sm font-semibold text-zinc-700">Clique para selecionar o arquivo</p>
                      <p className="text-xs text-zinc-500">PDF, JPG ou PNG</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-300 hover:bg-zinc-50">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-brand-tinto text-white hover:bg-brand-tinto-light disabled:opacity-50">
                  {isSubmitting ? 'Enviando...' : 'Fazer Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DESFILIAR */}
      {isDesfiliarOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 whitespace-normal">
          <div className="bg-white p-6 max-w-md w-full shadow-2xl relative border-t-4 border-red-600">
            <h3 className="text-lg font-bold font-serif mb-2 text-red-600">Confirmar Desfiliação</h3>
            <p className="text-sm text-zinc-600 mb-6">
              Tem certeza que deseja marcar o status como <strong>desfiliado</strong> para {filiado.nome}?
              A ficha ficará inativa. Você pode imprimir o documento de desfiliação antes ou depois dessa ação.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsDesfiliarOpen(false)} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-300 hover:bg-zinc-50">Cancelar</button>
              <button onClick={handleDesfiliar} disabled={isSubmitting} className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                <UserMinus size={16} /> {isSubmitting ? 'Processando...' : 'Confirmar Desfiliação'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL EXCLUIR ANEXO */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 whitespace-normal">
          <div className="bg-white p-6 max-w-md w-full shadow-2xl relative border-t-4 border-red-600">
            <h3 className="text-lg font-bold font-serif mb-2 text-red-600">Excluir Anexo de {uploadTipo === 'filiacao' ? 'Filiação' : 'Desfiliação'}</h3>
            <p className="text-sm text-zinc-600 mb-6">
              Tem certeza que deseja remover o arquivo anexado? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 text-sm text-zinc-600 border border-zinc-300 hover:bg-zinc-50">Cancelar</button>
              <button onClick={handleDeleteFile} disabled={isSubmitting} className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                <Trash2 size={16} /> {isSubmitting ? 'Removendo...' : 'Excluir Anexo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
