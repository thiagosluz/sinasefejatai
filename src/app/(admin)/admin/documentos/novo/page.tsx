import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'

import { TIPOS_DOCUMENTO } from '../lib/tipos-documento'

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
        {Object.entries(TIPOS_DOCUMENTO)
          .filter(([, config]) => !config.isAutomated)
          .map(([, config]) => {
          const Icon = config.icon
          return (
            <Link
              key={config.slug}
              href={`/admin/documentos/${config.slug}/novo`}
              className="group block bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] hover:shadow-[6px_6px_0px_var(--brand-tinto)] hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 bg-brand-tinto/10 text-brand-tinto rounded-none flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon size={24} />
              </div>
              <h3 className="font-serif font-bold text-xl text-brand-ink mb-2 group-hover:text-brand-tinto transition-colors">
                {config.label}
              </h3>
              <p className="text-sm text-zinc-600">
                {config.descricao}
              </p>
            </Link>
          )
        })}
      </div>
    </AdminPageWrapper>
  )
}
