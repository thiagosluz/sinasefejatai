'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { DocumentHeaderConfig } from '@/components/document-header'
import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/providers/modal-provider'

import { atualizarDocumentoAdministrativo, getDocumentoParaEdicao, salvarDocumentoAdministrativo } from '../../actions'
import { ResolucaoLayout } from '../../components/resolucao-layout'

interface FormResolucaoProps { config: DocumentHeaderConfig | null }

export default function FormResolucao({ config }: FormResolucaoProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { alert } = useModal()
  const supabase = createClient()

  const editarId = searchParams.get('editar')
  const isEditMode = !!editarId

  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(isEditMode)
  const [resolucoesAtivas, setResolucoesAtivas] = useState<{ id: string; numero: string; titulo: string }[]>([])
  
  const [dados, setDados] = useState(() => {
    const duplicar = searchParams.get('duplicar')
    if (duplicar) { 
      try { 
        const p = JSON.parse(duplicar)
        // Ao duplicar, não copiamos a informação de quem ela substitui para evitar conflitos automáticos
        const { resolucao_substituida_id, ...resto } = p
        return { ...resto, data_emissao: new Date().toISOString().split('T')[0] } 
      } catch { /* empty */ } 
    }
    return { ementa: '', considerandos: '', artigos: '', data_emissao: new Date().toISOString().split('T')[0], resolucao_substituida_id: '' }
  })

  useEffect(() => {
    // Buscar resoluções ativas para o select de "Substituir Resolução"
    const carregarResolucoes = async () => {
      const { data } = await supabase
        .from('documentos_administrativos')
        .select('id, numero, titulo')
        .eq('tipo', 'resolucao_normativa')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
      
      if (data) {
        // Se estivermos editando, não podemos deixar o documento substituir a si mesmo
        const filtradas = isEditMode ? data.filter(d => d.id !== editarId) : data
        setResolucoesAtivas(filtradas)
      }
    }
    carregarResolucoes()
  }, [supabase, isEditMode, editarId])

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
    if (!dados.artigos) { await alert('O texto da resolução (Artigos) é obrigatório.'); return }
    try {
      setSalvando(true)
      
      const tituloExtraido = dados.ementa 
        ? `Resolução: ${dados.ementa.substring(0, 40)}...` 
        : `Resolução Normativa`

      if (isEditMode && editarId) {
        await atualizarDocumentoAdministrativo(editarId, {
          titulo: tituloExtraido,
          dados,
        })
        router.push(`/admin/documentos/resolucoes/${editarId}`)
      } else {
        const novoDoc = await salvarDocumentoAdministrativo({ 
          tipo: 'resolucao_normativa', 
          titulo: tituloExtraido, 
          dados 
        })
        router.push(`/admin/documentos/resolucoes/${novoDoc.id}`)
      }
    } catch (err: unknown) { 
      console.error(err)
      await alert(err instanceof Error ? err.message : 'Erro ao salvar.') 
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
      <AdminPageHeader titulo={isEditMode ? 'Editar Resolução' : 'Nova Resolução'} subtitulo="Preencha os dados à esquerda e confira a visualização à direita.">
        <Link href={isEditMode ? `/admin/documentos/resolucoes/${editarId}` : '/admin/documentos/novo'} className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2">
          <ArrowLeft size={15} /> Voltar
        </Link>
      </AdminPageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)] h-max">
          <h3 className="font-serif font-bold text-lg text-brand-ink mb-6 border-b border-zinc-200 pb-2">Dados da Resolução Normativa</h3>
          <div className="space-y-4">
            
            {!isEditMode && resolucoesAtivas.length > 0 && (
              <div className="bg-orange-50 p-4 border border-orange-200 mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
                  Revogar / Substituir Resolução (Opcional)
                </label>
                <select 
                  value={dados.resolucao_substituida_id || ''} 
                  onChange={e => setDados({ ...dados, resolucao_substituida_id: e.target.value })}
                  className="w-full bg-white border-2 border-orange-300 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-orange-500"
                >
                  <option value="">-- Não revogar nenhuma --</option>
                  {resolucoesAtivas.map(r => (
                    <option key={r.id} value={r.id}>{r.numero} - {r.titulo}</option>
                  ))}
                </select>
                <p className="text-[10px] text-orange-700 mt-1">
                  Ao selecionar uma resolução acima, o sistema aplicará a tarja de &quot;Revogada&quot; nela automaticamente ao salvar.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Ementa (Resumo à direita)</label>
              <textarea rows={3} value={dados.ementa} onChange={e => setDados({ ...dados, ementa: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none"
                placeholder="Regulamenta o uso dos veículos oficiais..." />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Considerandos (um por linha)</label>
              <textarea rows={5} value={dados.considerandos} onChange={e => setDados({ ...dados, considerandos: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none"
                placeholder="a necessidade de otimizar...&#10;o regimento interno..." />
              <p className="text-[10px] text-zinc-500 mt-1">A palavra CONSIDERANDO será adicionada automaticamente em cada linha.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Artigos da Resolução</label>
              <textarea rows={10} value={dados.artigos} onChange={e => setDados({ ...dados, artigos: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-y min-h-[200px]"
                placeholder="Art. 1º Fica estabelecido que...&#10;§ 1º Os veículos...&#10;&#10;Art. 2º Esta resolução entra em vigor na data..." />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">Data de Emissão</label>
              <input type="date" value={dados.data_emissao} onChange={e => setDados({ ...dados, data_emissao: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink" />
            </div>

            <button onClick={handleSalvar} disabled={salvando}
              className="mt-6 w-full bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {salvando ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Salvar Resolução'}
            </button>
          </div>
        </div>

        <div className="bg-zinc-100 border border-zinc-200 p-4 lg:p-8 overflow-x-auto flex justify-center">
          <div className="transform scale-[0.6] sm:scale-75 lg:scale-[0.8] origin-top">
            <ResolucaoLayout dados={dados} config={config} numero="Gerado ao salvar" />
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
