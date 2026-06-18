'use client'

import { useState } from 'react'
import { CheckCircle2,FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

import { importarPlanilha } from '../actions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ImportarFiliadosModal({ isOpen, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ criados?: number, ignorados?: number } | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo de planilha (.xls, .xlsx, .csv)')
        return
      }
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro.')
      return
    }

    setIsUploading(true)
    setResult(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await importarPlanilha(formData)

      if (response.success) {
        toast.success('Importação concluída com sucesso!')
        setResult({
          criados: response.criados,
          ignorados: response.ignorados
        })
        setFile(null)
      } else {
        toast.error(response.error || 'Erro ao importar planilha.')
      }
    } catch {
      toast.error('Erro inesperado durante a importação.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetAndClose = () => {
    setFile(null)
    setResult(null)
    setIsUploading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2 text-zinc-800">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <FileSpreadsheet size={20} />
            </div>
            <h2 className="font-semibold text-lg">Importar Planilha</h2>
          </div>
          <button 
            onClick={resetAndClose}
            disabled={isUploading}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!result ? (
            <>
              <div className="text-sm text-zinc-600">
                Selecione uma planilha (<strong>.xls</strong> ou <strong>.xlsx</strong>) para importar os filiados. 
                Os registros já existentes serão ignorados (buscamos por CPF e Matrícula).
              </div>

              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  id="planilha-upload"
                  accept=".xls,.xlsx,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="planilha-upload"
                  className={`
                    flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${file ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 hover:border-emerald-400 hover:bg-zinc-50'}
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    {file ? (
                      <>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                          <FileSpreadsheet size={28} />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-800">{file.name}</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-zinc-100 text-zinc-500 rounded-full">
                          <UploadCloud size={28} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-700">Clique para selecionar</p>
                          <p className="text-sm text-zinc-500 mt-1">ou arraste o arquivo até aqui</p>
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={resetAndClose}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!file || isUploading}
                  className="flex items-center justify-center min-w-[120px] px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:bg-emerald-600"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Importando...
                    </>
                  ) : (
                    'Importar Dados'
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success Result State */
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">Importação Concluída!</h3>
              <p className="text-zinc-600 mb-6">
                A planilha foi processada com sucesso.
              </p>
              
              <div className="flex gap-4 mb-8 w-full">
                <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-emerald-600">{result.criados}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Novos<br/>Cadastros</div>
                </div>
                <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl p-4 shadow-sm">
                  <div className="text-3xl font-bold text-amber-600">{result.ignorados}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Ignorados<br/>(Já Existiam)</div>
                </div>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors"
              >
                Fechar e Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
