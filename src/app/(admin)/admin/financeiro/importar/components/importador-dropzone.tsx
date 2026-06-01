import { useRef, useState } from 'react'
import { Upload, Info } from 'lucide-react'

interface ImportadorDropzoneProps {
  loading: boolean
  onFileSelected: (file: File) => void
}

export function ImportadorDropzone({ loading, onFileSelected }: ImportadorDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <div className="bg-brand-card border border-brand-border p-6 shadow-md max-w-2xl mx-auto">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-ink/70 mb-4 font-serif border-b border-brand-border pb-2">Selecionar Arquivo OFX</h2>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
          dragging 
            ? 'border-brand-tinto bg-brand-tinto/5 scale-[0.99]' 
            : 'border-brand-border hover:border-brand-tinto hover:bg-brand-cream/50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".ofx"
          className="hidden"
        />
        <Upload size={38} className={`mx-auto mb-4 transition-colors ${dragging ? 'text-brand-tinto' : 'text-brand-ink/40'}`} />
        <p className="text-xs font-bold text-brand-ink uppercase tracking-wide">
          {loading ? 'Lendo arquivo...' : 'Arraste seu arquivo .OFX aqui ou clique para selecionar'}
        </p>
        <p className="text-[10px] text-zinc-500 mt-2">Suporta o arquivo exportado diretamente pelo Banco do Brasil.</p>
      </div>
      
      <div className="mt-6 bg-brand-cream/50 border border-brand-border p-4 flex gap-3 text-xs leading-relaxed text-zinc-700">
        <Info size={18} className="text-brand-tinto shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-brand-ink uppercase tracking-wide text-[10px] mb-1">Como exportar no Banco do Brasil?</p>
          <p>Acesse seu Internet Banking ou aplicativo do BB, vá em <strong>Extrato de Conta Corrente</strong>, selecione o período desejado e clique em <strong>Salvar Arquivo (Exportar)</strong> selecionando a opção <strong>OFX (Money)</strong>.</p>
        </div>
      </div>
    </div>
  )
}
