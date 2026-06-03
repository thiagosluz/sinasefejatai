import { ArrowLeft, Banknote, FileSignature } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

export default function NovoDocumentoPage() {
  return (
    <AdminPageWrapper>
      <AdminPageHeader 
        titulo="Emitir Novo Documento" 
        subtitulo="Selecione o modelo do documento que deseja gerar"
      >
        <Link 
          href="/admin/documentos" 
          className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Voltar
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link 
          href="/admin/documentos/recibos/novo"
          className="group block bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] hover:shadow-[6px_6px_0px_var(--brand-tinto)] hover:-translate-y-1 transition-all"
        >
          <div className="w-12 h-12 bg-brand-tinto/10 text-brand-tinto rounded-none flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Banknote size={24} />
          </div>
          <h3 className="font-serif font-bold text-xl text-brand-ink mb-2 group-hover:text-brand-tinto transition-colors">
            Recibo de Pagamento
          </h3>
          <p className="text-sm text-zinc-600">
            Gere um recibo oficial padrão A4, com cálculo automático de valor por extenso, para pagamentos de diárias, serviços ou auxílios.
          </p>
        </Link>

        {/* Placeholder para futuros documentos */}
        <div className="opacity-50 pointer-events-none block bg-zinc-50 border border-brand-border border-dashed p-6">
          <div className="w-12 h-12 bg-zinc-200 text-zinc-400 rounded-none flex items-center justify-center mb-4">
            <FileSignature size={24} />
          </div>
          <h3 className="font-serif font-bold text-xl text-zinc-500 mb-2">
            Ofício Oficial
          </h3>
          <p className="text-sm text-zinc-500">
            Em breve. Geração de ofícios padronizados com numeração automática e layout timbrado.
          </p>
        </div>

      </div>
    </AdminPageWrapper>
  )
}
