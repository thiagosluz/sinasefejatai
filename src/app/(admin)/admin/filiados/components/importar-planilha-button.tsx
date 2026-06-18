'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'

import ImportarFiliadosModal from './importar-filiados-modal'

export default function ImportarPlanilhaButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
      >
        <FileSpreadsheet size={15} />
        <span>Importar Planilha</span>
      </button>

      <ImportarFiliadosModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
