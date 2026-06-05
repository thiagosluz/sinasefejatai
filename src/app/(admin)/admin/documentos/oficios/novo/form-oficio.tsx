'use client'

import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { DocumentHeaderConfig } from '@/components/document-header'
import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { useModal } from '@/providers/modal-provider'

import { salvarDocumentoAdministrativo } from '../../actions'
import { OficioLayout } from '../../components/oficio-layout'

interface FormOficioProps {
  config: DocumentHeaderConfig | null
}

export default function FormOficio({ config }: FormOficioProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { alert } = useModal()

  const [salvando, setSalvando] = useState(false)
  const [dados, setDados] = useState(() => {
    const duplicar = searchParams.get('duplicar')
    if (duplicar) {
      try {
        const parsed = JSON.parse(duplicar)
        return { ...parsed, data_emissao: new Date().toISOString().split('T')[0] }
      } catch { /* empty */ }
    }
    return {
      destinatario_nome: '',
      destinatario_cargo: '',
      destinatario_instituicao: '',
      assunto: '',
      vocativo: 'Senhor(a)',
      corpo: '',
      fecho: 'Atenciosamente',
      data_emissao: new Date().toISOString().split('T')[0],
    }
  })

  const handleSalvar = async () => {
    if (!dados.destinatario_nome || !dados.assunto || !dados.corpo) {
      await alert('Preencha o destinatário, o assunto e o corpo do ofício.')
      return
    }

    try {
      setSalvando(true)
      const novoDoc = await salvarDocumentoAdministrativo({
        tipo: 'oficio',
        titulo: `Ofício: ${dados.assunto}`,
        dados,
      })
      router.push(`/admin/documentos/oficios/${novoDoc.id}`)
    } catch (err: unknown) {
      console.error(err)
      await alert(err instanceof Error ? err.message : 'Erro ao salvar o documento.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AdminPageWrapper>
      <AdminPageHeader
        titulo="Novo Ofício"
        subtitulo="Preencha os dados à esquerda e confira a visualização à direita."
      >
        <Link
          href="/admin/documentos/novo"
          className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Voltar
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)]">
          <h3 className="font-serif font-bold text-lg text-brand-ink mb-6 border-b border-zinc-200 pb-2">Dados do Ofício</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Destinatário (Nome / Instituição)</label>
              <input type="text" value={dados.destinatario_nome} onChange={e => setDados({ ...dados, destinatario_nome: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Ex: Magnífico Reitor do IFG" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Cargo do Destinatário</label>
              <input type="text" value={dados.destinatario_cargo} onChange={e => setDados({ ...dados, destinatario_cargo: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Ex: Reitor do Instituto Federal de Goiás" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Instituição (opcional)</label>
              <input type="text" value={dados.destinatario_instituicao} onChange={e => setDados({ ...dados, destinatario_instituicao: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Ex: Instituto Federal de Goiás - Campus Jataí" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Assunto</label>
              <input type="text" value={dados.assunto} onChange={e => setDados({ ...dados, assunto: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Resumo do assunto do ofício" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Vocativo</label>
              <input type="text" value={dados.vocativo} onChange={e => setDados({ ...dados, vocativo: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Ex: Senhor Reitor" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Corpo do Texto</label>
              <textarea rows={8} value={dados.corpo} onChange={e => setDados({ ...dados, corpo: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none"
                placeholder="Escreva o conteúdo do ofício. Use Enter para criar novos parágrafos." />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Fecho</label>
              <select value={dados.fecho} onChange={e => setDados({ ...dados, fecho: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink cursor-pointer">
                <option value="Atenciosamente">Atenciosamente</option>
                <option value="Respeitosamente">Respeitosamente</option>
                <option value="Cordialmente">Cordialmente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Data de Emissão</label>
              <input type="date" value={dados.data_emissao} onChange={e => setDados({ ...dados, data_emissao: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" />
            </div>

            <button onClick={handleSalvar} disabled={salvando}
              className="mt-6 w-full bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} />
              {salvando ? 'Salvando...' : 'Salvar e Gerar Ofício'}
            </button>
          </div>
        </div>

        {/* Visualização */}
        <div className="bg-zinc-100 border border-zinc-200 p-4 lg:p-8 overflow-x-auto flex justify-center">
          <div className="transform scale-[0.6] sm:scale-75 lg:scale-[0.8] origin-top">
            <OficioLayout dados={dados} config={config} numero="Gerado ao salvar" />
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
