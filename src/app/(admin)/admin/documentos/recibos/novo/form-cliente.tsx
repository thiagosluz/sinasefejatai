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
import { ReciboLayout } from '../../components/recibo-layout'

interface FormClienteProps {
  config: DocumentHeaderConfig | null
  salarioMinimo?: number
  filiados?: { id: string; nome: string; cpf: string | null }[]
}

export default function FormCliente({ config, salarioMinimo = 1621.00, filiados = [] }: FormClienteProps) {
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
        return {
          ...parsed,
          data_emissao: new Date().toISOString().split('T')[0]
        }
      } catch { }
    }
    return {
      valor: 0,
      recebedor_nome: '',
      recebedor_cpf: '',
      referente_a: '',
      data_emissao: new Date().toISOString().split('T')[0]
    }
  })

  // Estados para a calculadora de diárias
  const [isDiarias, setIsDiarias] = useState(false)
  const [dataIda, setDataIda] = useState(new Date().toISOString().split('T')[0])
  const [dataVolta, setDataVolta] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (isDiarias) {
      if (!dataIda || !dataVolta) return

      // Criar datas em UTC para evitar bugs de fuso horário
      const d1 = new Date(dataIda + 'T00:00:00Z')
      const d2 = new Date(dataVolta + 'T00:00:00Z')

      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return

      const diffTime = d2.getTime() - d1.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let total = 0
      let qtdInteiras = 0
      let qtdMeias = 0

      if (diffDays === 0) {
        // Bate-e-volta: Apenas 1 meia-diária (5%)
        qtdInteiras = 0
        qtdMeias = 1
      } else if (diffDays > 0) {
        // Viagem com pernoite: 
        // 1 inteira (10%) para cada noite (diffDays) 
        // + 2 meias (5% cada) para os dias de ida e volta
        qtdInteiras = diffDays
        qtdMeias = 2
      }

      total = (qtdInteiras * (salarioMinimo * 0.10)) + (qtdMeias * (salarioMinimo * 0.05))

      // Formatando (DD/MM/YYYY)
      const d1Str = d1.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      const d2Str = d2.toLocaleDateString('pt-BR', { timeZone: 'UTC' })

      const texto = `pagamento de diárias para o período de ${d1Str} a ${d2Str}, correspondente a ${qtdInteiras} diária(s) inteira(s) para os dias de evento e ${qtdMeias} meia(s) diária(s) para deslocamento de ida e volta, destinadas à participação no(a)`

      // eslint-disable-next-line react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any
      setDados((prev: any) => ({
        ...prev,
        valor: parseFloat(total.toFixed(2)),
        referente_a: texto
      }))
    }
  }, [isDiarias, dataIda, dataVolta, salarioMinimo])

  useEffect(() => {
    if (editarId) {
      getDocumentoParaEdicao(editarId)
        .then((doc) => {
          setDados(doc.dados)
        })
        .catch(async (err) => {
          await alert(err instanceof Error ? err.message : 'Erro ao carregar documento.')
          router.push('/admin/documentos')
        })
        .finally(() => setCarregando(false))
    }
  }, [editarId, alert, router])

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value
    let newCpf = dados.recebedor_cpf

    if (filiados && filiados.length > 0) {
      const filiadoEncontrado = filiados.find(f => f.nome === nome)
      if (filiadoEncontrado && filiadoEncontrado.cpf) {
        newCpf = filiadoEncontrado.cpf
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDados((prev: any) => ({ ...prev, recebedor_nome: nome, recebedor_cpf: newCpf }))
  }

  const handleSalvar = async () => {
    if (!dados.valor || !dados.recebedor_nome || !dados.referente_a) {
      await alert('Preencha o valor, o nome do recebedor e a referência do recibo.')
      return
    }

    try {
      setSalvando(true)

      if (isEditMode && editarId) {
        await atualizarDocumentoAdministrativo(editarId, {
          titulo: `Recibo: ${dados.recebedor_nome}`,
          dados,
        })
        router.push(`/admin/documentos/recibos/${editarId}`)
      } else {
        const novoDoc = await salvarDocumentoAdministrativo({
          tipo: 'recibo_pagamento',
          titulo: `Recibo: ${dados.recebedor_nome}`,
          dados: dados
        })
        router.push(`/admin/documentos/recibos/${novoDoc.id}`)
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
      <AdminPageHeader
        titulo={isEditMode ? 'Editar Recibo' : 'Novo Recibo'}
        subtitulo="Preencha os dados à esquerda e confira a visualização à direita."
      >
        <Link
          href={isEditMode ? `/admin/documentos/recibos/${editarId}` : '/admin/documentos/novo'}
          className="bg-brand-cream hover:bg-brand-card text-brand-ink text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] border border-brand-ink flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Voltar
        </Link>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Formulário */}
        <div className="bg-white border border-brand-border p-6 shadow-[4px_4px_0px_var(--brand-ink)]">
          <h3 className="font-serif font-bold text-lg text-brand-ink mb-6 border-b border-zinc-200 pb-2">Dados do Pagamento</h3>

          <div className="space-y-4">

            <div className="flex items-center gap-2 bg-brand-cream border border-brand-ink/20 p-3 mb-4">
              <input
                type="checkbox"
                id="isDiarias"
                checked={isDiarias}
                onChange={e => setIsDiarias(e.target.checked)}
                className="w-4 h-4 accent-brand-tinto cursor-pointer"
              />
              <label htmlFor="isDiarias" className="text-sm font-bold text-brand-ink cursor-pointer select-none">
                Recibo de Pagamento de Diárias (Cálculo Automático)
              </label>
            </div>

            {isDiarias && (
              <div className="grid grid-cols-2 gap-4 bg-brand-cream border border-brand-ink/20 p-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-ink mb-1">
                    Data de Ida (Partida)
                  </label>
                  <input
                    type="date"
                    value={dataIda}
                    onChange={e => setDataIda(e.target.value)}
                    className="w-full bg-white border-2 border-brand-border px-3 py-1.5 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-ink mb-1">
                    Data de Volta (Retorno)
                  </label>
                  <input
                    type="date"
                    min={dataIda}
                    value={dataVolta}
                    onChange={e => setDataVolta(e.target.value)}
                    className="w-full bg-white border-2 border-brand-border px-3 py-1.5 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Valor (R$) {isDiarias && <span className="text-brand-tinto lowercase font-normal">(Calculado)</span>}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={dados.valor || ''}
                onChange={e => setDados({ ...dados, valor: parseFloat(e.target.value) })}
                readOnly={isDiarias}
                className={`w-full border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink ${isDiarias ? 'bg-zinc-200 cursor-not-allowed opacity-80' : 'bg-brand-cream'}`}
                placeholder="Ex: 648.40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Nome do Recebedor
              </label>
              <input
                type="text"
                list="lista-filiados"
                value={dados.recebedor_nome}
                onChange={handleNomeChange}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Ex: Nome do Filiado ou Filiada completo"
              />
              {filiados && filiados.length > 0 && (
                <datalist id="lista-filiados">
                  {filiados.map(f => (
                    <option key={f.id} value={f.nome} />
                  ))}
                </datalist>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                CPF do Recebedor
              </label>
              <input
                type="text"
                value={dados.recebedor_cpf}
                onChange={e => setDados({ ...dados, recebedor_cpf: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
                placeholder="Ex: 000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Referente A
              </label>
              <textarea
                rows={3}
                value={dados.referente_a}
                onChange={e => setDados({ ...dados, referente_a: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink resize-none"
                placeholder="Ex: pagamento de 4 (quatro) diárias para participação no Seminário..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                value={dados.data_emissao}
                onChange={e => setDados({ ...dados, data_emissao: e.target.value })}
                className="w-full bg-brand-cream border-2 border-brand-border px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-ink"
              />
            </div>

            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="mt-6 w-full bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-3 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {salvando ? 'Salvando...' : isEditMode ? 'Salvar Alterações' : 'Salvar e Gerar Recibo'}
            </button>
          </div>
        </div>

        {/* Visualização */}
        <div className="bg-zinc-100 border border-zinc-200 p-4 lg:p-8 overflow-x-auto flex justify-center">
          {/* A div #recibo-print-area só é usada se precisarmos forçar impressão daqui, mas o fluxo é salvar antes */}
          <div className="transform scale-[0.6] sm:scale-75 lg:scale-[0.8] origin-top">
            <ReciboLayout dados={dados} config={config} numero="Gerado ao salvar" />
          </div>
        </div>

      </div>
    </AdminPageWrapper>
  )
}
