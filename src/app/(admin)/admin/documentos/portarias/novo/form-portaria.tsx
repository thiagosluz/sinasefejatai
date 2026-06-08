'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { DocumentHeaderConfig } from '@/components/document-header'
import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { useModal } from '@/providers/modal-provider'

import { atualizarDocumentoAdministrativo, getDocumentoParaEdicao, salvarDocumentoAdministrativo } from '../../actions'
import { PortariaLayout } from '../../components/portaria-layout'

interface FormPortariaProps { config: DocumentHeaderConfig | null }

export default function FormPortaria({ config }: FormPortariaProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { alert } = useModal()

  const editarId = searchParams.get('editar')
  const isEditMode = !!editarId

  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(isEditMode)
  const [dados, setDados] = useState(() => {
    const duplicar = searchParams.get('duplicar')
    if (duplicar) { try { const p = JSON.parse(duplicar); return { ...p, data_emissao: new Date().toISOString().split('T')[0] } } catch { /* empty */ } }
    return { emitente: 'O Coordenador Geral do SINASEFE - Seção Sindical Jataí', considerandos: '', resolve: '', data_emissao: new Date().toISOString().split('T')[0] }
  })

  useEffect(() => {
    if (editarId) {
      getDocumentoParaEdicao(editarId)
        .then((doc) => setDados(doc.dados))
        .catch(async (err) => {
          await alert(err instanceof Error ? err.message : 'Erro ao carregar documento.')
          router.push('/admin/documentos')
        })
        .finally(() => setCarregando(false))
    }
  }, [editarId, alert, router])

  const handleSalvar = async () => {
    if (!dados.emitente || !dados.resolve) { await alert('Preencha o emitente e o texto da seção RESOLVE.'); return }
    try {
      setSalvando(true)
      if (isEditMode && editarId) {
        await atualizarDocumentoAdministrativo(editarId, {
          titulo: `Portaria: ${dados.resolve.substring(0, 30)}...`,
          dados,
        })
        router.push(`/admin/documentos/portarias/${editarId}`)
      } else {
        const novoDoc = await salvarDocumentoAdministrativo({ tipo: 'portaria', titulo: `Portaria: ${dados.resolve.substring(0, 30)}...`, dados })
        router.push(`/admin/documentos/portarias/${novoDoc.id}`)
      }
    } catch (err: unknown) { console.error(err); await alert(err instanceof Error ? err.message : 'Erro ao salvar.') }
    finally { setSalvando(false) }
  }

  if (carregando) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center py-20 text-brand-ink/60 font-serif italic">
          Carregando documento...
        </div>
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo={isEditMode ? 'Editar Portaria' : 'Nova Portaria'} subtitulo="Preencha os dados à esquerda e confira a visualização à direita.">
        <Link href={isEditMode ? `/admin/documentos/portarias/${editarId}` : '/admin/documentos/novo'} className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2">
          <ArrowLeft size={15} /> Voltar
        </Link>
      </AdminPageHeader>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)]">
          <h3 className="font-serif font-bold text-lg text-brand-ink mb-6 border-b border-zinc-200 pb-2">Dados da Portaria</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Emitente</label>
              <input type="text" value={dados.emitente} onChange={e => setDados({ ...dados, emitente: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" placeholder="Ex: O Coordenador Geral do SINASEFE..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Considerandos (um por linha)</label>
              <textarea rows={6} value={dados.considerandos} onChange={e => setDados({ ...dados, considerandos: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none"
                placeholder="que o servidor...&#10;que a necessidade..." />
              <p className="text-[10px] text-zinc-500 mt-1">A palavra CONSIDERANDO será adicionada automaticamente.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Resolve</label>
              <textarea rows={8} value={dados.resolve} onChange={e => setDados({ ...dados, resolve: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none"
                placeholder="Art. 1º Designar...&#10;Art. 2º Esta portaria entra em vigor na data de sua publicação." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Data de Emissão</label>
              <input type="date" value={dados.data_emissao} onChange={e => setDados({ ...dados, data_emissao: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" />
            </div>
            <button onClick={handleSalvar} disabled={salvando}
              className="mt-6 w-full bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {salvando ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Salvar e Gerar Portaria'}
            </button>
          </div>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 p-4 lg:p-8 overflow-x-auto flex justify-center">
          <div className="transform scale-[0.6] sm:scale-75 lg:scale-[0.8] origin-top">
            <PortariaLayout dados={dados} config={config} numero="Gerado ao salvar" />
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
