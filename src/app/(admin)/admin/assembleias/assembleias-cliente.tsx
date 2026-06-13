'use client'

import { useCallback, useMemo, useState } from 'react'
import { PlusCircle, Search } from 'lucide-react'
import Link from 'next/link'

import AdminPageHeader from '@/components/layout/admin-page-header'
import AdminPageWrapper from '@/components/layout/admin-page-wrapper'
import { useModal } from '@/providers/modal-provider'

import { AssembleiaCard } from './components/assembleia-card'
import { deleteAssembleia, updateStatusAssembleia } from './actions'
import { Assembleia } from './types'

interface AssembleiasClienteProps {
  assembleiasIniciais: Assembleia[]
}

type TabType = 'Todas' | 'Agendada' | 'Rascunho' | 'Concluída' | 'Cancelada'

export default function AssembleiasCliente({ assembleiasIniciais }: AssembleiasClienteProps) {
  const { confirm, prompt, alert } = useModal()
  
  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<TabType>('Todas')
  
  const anoAtual = new Date().getFullYear().toString()
  const [anoFiltro, setAnoFiltro] = useState<string>(anoAtual)
  const [mesFiltro, setMesFiltro] = useState<string>('Todos')

  // Extrair Anos Dinamicamente
  const anosDisponiveis = useMemo(() => {
    const anos = new Set(assembleiasIniciais.map(a => {
      // Ajuste para evitar fuso horário quebrando o ano: usamos substring da data ISO (yyyy-mm-dd)
      return a.data_realizacao.substring(0, 4)
    }))
    anos.add(anoAtual) // Garante que o ano atual sempre apareça
    return Array.from(anos).sort((a,b) => b.localeCompare(a))
  }, [assembleiasIniciais, anoAtual])

  // Extrair Meses Dinamicamente baseado no Ano Selecionado
  const mesesDisponiveis = useMemo(() => {
    if (anoFiltro === 'Todos') return []
    const meses = new Set(
      assembleiasIniciais
        .filter(a => a.data_realizacao.substring(0, 4) === anoFiltro)
        .map(a => {
          // Extrair mês de yyyy-mm-dd (retorna '01' a '12')
          return a.data_realizacao.substring(5, 7)
        })
    )
    return Array.from(meses).sort()
  }, [assembleiasIniciais, anoFiltro])

  const nomesMeses: Record<string, string> = {
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril', 
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto', 
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  }

  // Filtragem Client-Side Instantânea
  const assembleiasFiltradas = useMemo(() => {
    return assembleiasIniciais.filter((a) => {
      // 1. Filtro por Aba/Status
      const passaAba = abaAtiva === 'Todas' || a.status === abaAtiva

      // 2. Filtro por Ano
      const passaAno = anoFiltro === 'Todos' || a.data_realizacao.substring(0, 4) === anoFiltro

      // 3. Filtro por Mês
      const passaMes = mesFiltro === 'Todos' || a.data_realizacao.substring(5, 7) === mesFiltro

      // 4. Filtro por Texto (Título, Edital ou Pautas)
      const termoBusca = busca.toLowerCase()
      const textoPautas = a.pautas?.join(' ') || ''
      const passaBusca = 
        a.tipo.toLowerCase().includes(termoBusca) || 
        (a.numero && a.numero.toLowerCase().includes(termoBusca)) ||
        textoPautas.toLowerCase().includes(termoBusca)

      return passaAba && passaAno && passaMes && passaBusca
    })
  }, [assembleiasIniciais, abaAtiva, anoFiltro, mesFiltro, busca])

  // Ações de Mudança de Status
  const handleAlterarStatus = useCallback(async (id: string, novoStatus: string) => {
    if (await confirm(`Deseja realmente marcar esta assembleia como ${novoStatus}?`)) {
      try {
        await updateStatusAssembleia(id, novoStatus)
      } catch (err) {
        console.error(err)
      }
    }
  }, [confirm])

  const handleDeletarSeguro = useCallback(async (id: string) => {
    const word = await prompt('Para excluir definitivamente esta assembleia e todos os seus dados, digite a palavra DELETAR:')
    if (word === 'DELETAR') {
      try {
        await deleteAssembleia(id)
      } catch (err: unknown) {
        console.error(err)
        await alert(err instanceof Error ? err.message : 'Erro ao deletar assembleia.')
      }
    } else if (word !== null) {
      await alert('Palavra de segurança incorreta. A exclusão foi cancelada.')
    }
  }, [prompt, alert])

  return (
    <AdminPageWrapper>
      <AdminPageHeader titulo="Atos & Assembleias" subtitulo="Agendamento e Emissão de Editais, Listas e Atas">
        <Link 
          href="/admin/assembleias/nova" 
          className="bg-brand-tinto hover:bg-brand-tinto-light text-white text-xs font-serif font-bold uppercase tracking-wider py-2.5 px-4 transition-all shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[0px_0px_0px_var(--brand-ink)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Agendar Assembleia</span>
        </Link>
      </AdminPageHeader>

      {/* Barra de Filtros e Buscas */}
      <div className="mb-8 flex flex-col justify-between items-start gap-4 bg-brand-border/10 p-4 border-2 border-brand-border">
        {/* Linha Superior: Abas e Selects de Data */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {(['Todas', 'Agendada', 'Rascunho', 'Concluída', 'Cancelada'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setAbaAtiva(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${
                  abaAtiva === tab 
                    ? 'bg-brand-ink text-brand-cream border-brand-ink' 
                    : 'bg-transparent text-brand-ink border-transparent hover:border-brand-ink/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={anoFiltro}
              onChange={(e) => {
                setAnoFiltro(e.target.value)
                setMesFiltro('Todos') // reseta o mês ao trocar de ano
              }}
              className="bg-brand-cream border-2 border-brand-border px-4 py-2 text-xs font-bold uppercase text-brand-ink focus:outline-none focus:border-brand-ink cursor-pointer"
            >
              <option value="Todos">Todos os Anos</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>

            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              disabled={anoFiltro === 'Todos' || mesesDisponiveis.length === 0}
              className="bg-brand-cream border-2 border-brand-border px-4 py-2 text-xs font-bold uppercase text-brand-ink focus:outline-none focus:border-brand-ink cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Todos">Todos os Meses</option>
              {mesesDisponiveis.map(mes => (
                <option key={mes} value={mes}>{nomesMeses[mes]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha Inferior: Busca por Texto */}
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Buscar termo, pauta ou edital..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-brand-cream border-2 border-brand-border px-10 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-ink placeholder:text-brand-ink/40"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/40" />
        </div>
      </div>

      {/* Grid de Convocatórias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {assembleiasFiltradas.length === 0 ? (
          <div className="lg:col-span-2 bg-brand-card border border-brand-border p-12 text-center shadow-xl">
            <Search className="mx-auto h-12 w-12 text-brand-ink/40 mb-4" />
            <h3 className="text-lg font-serif font-bold text-brand-ink">Nenhuma assembleia encontrada</h3>
            <p className="text-zinc-600 text-xs mt-2">Tente buscar por outras palavras ou alterar a aba de status.</p>
          </div>
        ) : (
          assembleiasFiltradas.map((assembleia) => (
            <AssembleiaCard 
              key={assembleia.id} 
              assembleia={assembleia} 
              onAlterarStatus={handleAlterarStatus}
              onDeletarSeguro={handleDeletarSeguro}
            />
          ))
        )}
      </div>
    </AdminPageWrapper>
  )
}
