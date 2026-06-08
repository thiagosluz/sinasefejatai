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
import { MemorandoLayout } from '../../components/memorando-layout'

interface FormMemorandoProps {
  config: DocumentHeaderConfig | null
}

export default function FormMemorando({ config }: FormMemorandoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { alert } = useModal()

  const editarId = searchParams.get('editar')
  const isEditMode = !!editarId

  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(isEditMode)
  const [dados, setDados] = useState(() => {
    const duplicar = searchParams.get('duplicar')
    if (duplicar) {
      try {
        const parsed = JSON.parse(duplicar)
        return { ...parsed, data_emissao: new Date().toISOString().split('T')[0] }
      } catch { /* empty */ }
    }
    return {
      de: '',
      para: '',
      assunto: '',
      corpo: '',
      data_emissao: new Date().toISOString().split('T')[0],
    }
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
    if (!dados.de || !dados.para || !dados.assunto || !dados.corpo) {
      await alert('Preencha todos os campos obrigatórios: De, Para, Assunto e Corpo.')
      return
    }
    try {
      setSalvando(true)
      if (isEditMode && editarId) {
        await atualizarDocumentoAdministrativo(editarId, {
          titulo: `Memorando: ${dados.assunto}`,
          dados,
        })
        router.push(`/admin/documentos/memorandos/${editarId}`)
      } else {
        const novoDoc = await salvarDocumentoAdministrativo({
          tipo: 'memorando',
          titulo: `Memorando: ${dados.assunto}`,
          dados,
        })
        router.push(`/admin/documentos/memorandos/${novoDoc.id}`)
      }
    } catch (err: unknown) {
      console.error(err)
      await alert(err instanceof Error ? err.message : 'Erro ao salvar o documento.')
    } finally {
      setSalvando(false)
    }
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
      <AdminPageHeader titulo={isEditMode ? 'Editar Memorando' : 'Novo Memorando'} subtitulo="Preencha os dados à esquerda e confira a visualização à direita.">
        <Link href={isEditMode ? `/admin/documentos/memorandos/${editarId}` : '/admin/documentos/novo'} className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2">
          <ArrowLeft size={15} /> Voltar
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)]">
          <h3 className="font-serif font-bold text-lg text-brand-ink mb-6 border-b border-zinc-200 pb-2">Dados do Memorando</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">De (Remetente)</label>
              <input type="text" value={dados.de} onChange={e => setDados({ ...dados, de: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" placeholder="Ex: Coordenação Geral" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Para (Destinatário)</label>
              <input type="text" value={dados.para} onChange={e => setDados({ ...dados, para: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" placeholder="Ex: Comissão de Finanças" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Assunto</label>
              <input type="text" value={dados.assunto} onChange={e => setDados({ ...dados, assunto: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" placeholder="Resumo do assunto" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Corpo do Texto</label>
              <textarea rows={8} value={dados.corpo} onChange={e => setDados({ ...dados, corpo: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none" placeholder="Escreva o conteúdo do memorando..." />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Data de Emissão</label>
              <input type="date" value={dados.data_emissao} onChange={e => setDados({ ...dados, data_emissao: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" />
            </div>
            <button onClick={handleSalvar} disabled={salvando}
              className="mt-6 w-full bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {salvando ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Salvar e Gerar Memorando'}
            </button>
          </div>
        </div>
        <div className="bg-zinc-100 border border-zinc-200 p-4 lg:p-8 overflow-x-auto flex justify-center">
          <div className="transform scale-[0.6] sm:scale-75 lg:scale-[0.8] origin-top">
            <MemorandoLayout dados={dados} config={config} numero="Gerado ao salvar" />
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
