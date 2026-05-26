'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  ArrowLeft, 
  Check, 
  Info,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { parseOFX, OFXTransaction } from '@/lib/ofx-parser'
import { checkExistingTransactions, importTransactions, SaveTransaction } from '../actions-ofx'
import { useModal } from '@/providers/modal-provider'

interface ExtendedTransaction extends OFXTransaction {
  selected: boolean;
  categoria: string;
  alreadyExists: boolean;
}

const CATEGORIAS_ENTRADA = [
  'Contribuição de Filiados',
  'Repasse Nacional',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

const CATEGORIAS_SAIDA = [
  'Tarifas Bancárias',
  'Despesas Administrativas',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas com Viagens',
  'Outros'
]

export default function ImportadorCliente() {
  const router = useRouter()
  const { alert, confirm } = useModal()
  
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [transacoes, setTransacoes] = useState<ExtendedTransaction[]>([])
  const [nomeArquivo, setNomeArquivo] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mapeamento automático inteligente de categorias
  const sugerirCategoria = (descricao: string, tipo: 'Entrada' | 'Saída'): string => {
    const desc = descricao.toLowerCase();
    
    if (tipo === 'Entrada') {
      if (/rendimento|rend|juros|aplic/i.test(desc)) return 'Rendimentos';
      if (/repasse|nacional|sinasefe/i.test(desc)) return 'Repasse Nacional';
      if (/saldo|abertura|inicial/i.test(desc)) return 'Saldo de Abertura';
      return 'Contribuição de Filiados'; // Padrão mais comum
    } else {
      if (/tarifa|cobranca|manutencao|mensal|anuidade/i.test(desc)) return 'Tarifas Bancárias';
      if (/viagem|hosped|transp|combust|aliment|diaria/i.test(desc)) return 'Despesas com Viagens';
      if (/evento|mobiliz|reuniao|paraliz|panf|som/i.test(desc)) return 'Eventos/Mobilizações';
      if (/servico|terc|honor|advoc|contab|advogado|contador/i.test(desc)) return 'Serviços de Terceiros';
      if (/papel|copia|resma|escrit|consumo|pasta|caneta/i.test(desc)) return 'Material de Consumo';
      if (/aluguel|luz|agua|tel|internet|adm|taxa|condominio/i.test(desc)) return 'Despesas Administrativas';
      return 'Outros';
    }
  }

  // Leitura e processamento do arquivo
  const processarArquivo = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      await alert('Por favor, envie um arquivo com extensão .OFX')
      return
    }

    setLoading(true)
    setNomeArquivo(file.name)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        if (!text) {
          setLoading(false)
          await alert('Não foi possível ler o arquivo. Certifique-se de que ele não está vazio.')
          return
        }

        const parsed = parseOFX(text)
        if (parsed.length === 0) {
          setLoading(false)
          await alert('Nenhuma transação financeira válida foi encontrada dentro do arquivo OFX.')
          return
        }

        // Consultar banco para verificar duplicidades (FITIDs que já existem)
        const fitids = parsed.map(t => t.id)
        const existentes = await checkExistingTransactions(fitids)

        // Estruturar dados da tabela conciliadora
        const extended: ExtendedTransaction[] = parsed.map(t => {
          const alreadyExists = existentes.includes(t.id)
          return {
            ...t,
            alreadyExists,
            selected: !alreadyExists, // Marcado para importação por padrão se for inédito
            categoria: sugerirCategoria(t.descricao, t.tipo)
          }
        })

        setTransacoes(extended)
        setLoading(false)
      }

      reader.onerror = () => {
        setLoading(false)
        alert('Erro ao carregar o arquivo.')
      }

      reader.readAsText(file)
    } catch (err) {
      console.error(err)
      setLoading(false)
      await alert('Ocorreu um erro inesperado ao analisar o extrato.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processarArquivo(file)
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
      processarArquivo(file)
    }
  }

  const handleToggleSelect = (index: number) => {
    const updated = [...transacoes]
    if (updated[index].alreadyExists) return // Bloqueia mudança de já existentes
    updated[index].selected = !updated[index].selected
    setTransacoes(updated)
  }

  const handleToggleAll = (val: boolean) => {
    const updated = transacoes.map(t => ({
      ...t,
      selected: t.alreadyExists ? false : val
    }))
    setTransacoes(updated)
  }

  const handleCategoryChange = (index: number, cat: string) => {
    const updated = [...transacoes]
    updated[index].categoria = cat
    setTransacoes(updated)
  }

  const handleImportSubmit = async () => {
    const selecionadas = transacoes.filter(t => t.selected)
    
    if (selecionadas.length === 0) {
      await alert('Por favor, selecione ao menos 1 lançamento para importar.')
      return
    }

    if (await confirm(`Deseja realmente confirmar a importação de ${selecionadas.length} lançamentos para o Livro Caixa?`)) {
      setLoading(true)
      
      const payload: SaveTransaction[] = selecionadas.map(t => ({
        data: t.data,
        tipo: t.tipo,
        descricao: t.descricao,
        valor: t.valor,
        categoria: t.categoria,
        banco_id: t.id
      }))

      try {
        const res = await importTransactions(payload)
        setLoading(false)
        if (res.success) {
          router.push(`/financeiro?success=${encodeURIComponent(res.message)}`)
        } else {
          await alert(res.message)
        }
      } catch (err) {
        console.error(err)
        setLoading(false)
        await alert('Ocorreu um erro no processamento da importação.')
      }
    }
  }

  // Estatísticas de importação
  const totalSelecionadas = transacoes.filter(t => t.selected).length
  const totalValorSelecionadas = transacoes
    .filter(t => t.selected)
    .reduce((sum, t) => sum + (t.tipo === 'Entrada' ? t.valor : -t.valor), 0)

  return (
    <div className="space-y-6">
      
      {/* Botão Voltar */}
      <div className="print:hidden">
        <Link 
          href="/financeiro" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink hover:text-brand-tinto transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao Livro Caixa
        </Link>
      </div>

      {transacoes.length === 0 ? (
        /* 1. Área de Upload (Drag & Drop) */
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
      ) : (
        /* 2. Área de Conciliação e Tabela */
        <div className="space-y-6">
          
          {/* Informações Gerais do Arquivo */}
          <div className="bg-brand-card border border-brand-border p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-tinto/10 border border-brand-tinto/20 p-2.5 text-brand-tinto">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-ink/50 uppercase tracking-wider">Arquivo Selecionado</p>
                <h4 className="text-sm font-bold text-brand-ink">{nomeArquivo}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <span className="text-brand-ink/50 block text-[9px]">Lançamentos</span>
                <span>{transacoes.length} encontrados</span>
              </div>
              <div className="w-[1px] h-8 bg-brand-border"></div>
              <div>
                <span className="text-brand-ink/50 block text-[9px]">A Importar</span>
                <span className="text-brand-tinto">{totalSelecionadas} transações</span>
              </div>
              <div className="w-[1px] h-8 bg-brand-border"></div>
              <div>
                <span className="text-brand-ink/50 block text-[9px]">Resultado Líquido</span>
                <span className={totalValorSelecionadas >= 0 ? 'text-brand-olive' : 'text-brand-tinto'}>
                  R$ {totalValorSelecionadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Tabela Conciliadora */}
          <div className="bg-brand-card border border-brand-border shadow-xl overflow-hidden">
            <div className="bg-brand-border/20 px-6 py-3 border-b border-brand-border flex items-center justify-between text-xs font-bold text-brand-ink/70 uppercase tracking-wider">
              <span>Conciliar Lançamentos</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleToggleAll(true)}
                  className="hover:text-brand-tinto transition-colors cursor-pointer text-[10px]"
                >
                  Selecionar Todos
                </button>
                <span className="text-brand-border">|</span>
                <button 
                  onClick={() => handleToggleAll(false)}
                  className="hover:text-brand-tinto transition-colors cursor-pointer text-[10px]"
                >
                  Limpar Seleções
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead className="bg-brand-border/40 border-b border-brand-border text-brand-ink/70 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6 border-r border-brand-border w-12 text-center">
                      <input 
                        type="checkbox"
                        checked={transacoes.filter(t => !t.alreadyExists).every(t => t.selected)}
                        onChange={(e) => handleToggleAll(e.target.checked)}
                        className="cursor-pointer accent-brand-tinto rounded-none"
                      />
                    </th>
                    <th className="py-4 px-6 border-r border-brand-border w-32">Data</th>
                    <th className="py-4 px-6 border-r border-brand-border">Descrição Original</th>
                    <th className="py-4 px-6 border-r border-brand-border w-48 text-center">Fluxo</th>
                    <th className="py-4 px-6 border-r border-brand-border text-right w-40">Valor</th>
                    <th className="py-4 px-6 border-r border-brand-border w-64">Categoria Sugerida</th>
                    <th className="py-4 px-6 text-center w-36">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border bg-white font-mono">
                  {transacoes.map((t, idx) => (
                    <tr 
                      key={t.id} 
                      className={`hover:bg-brand-cream/20 transition-all ${
                        t.alreadyExists 
                          ? 'bg-zinc-100/70 text-zinc-400' 
                          : t.selected 
                            ? 'bg-white' 
                            : 'bg-zinc-50/50 text-zinc-500'
                      }`}
                    >
                      <td className="py-4 px-6 border-r border-brand-border text-center">
                        <input 
                          type="checkbox" 
                          checked={t.selected}
                          disabled={t.alreadyExists}
                          onChange={() => handleToggleSelect(idx)}
                          className="cursor-pointer accent-brand-tinto disabled:opacity-40 disabled:cursor-not-allowed rounded-none"
                        />
                      </td>
                      <td className="py-4 px-6 border-r border-brand-border font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="opacity-40" />
                          <span>
                            {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 border-r border-brand-border max-w-xs truncate font-semibold" title={t.descricao}>
                        {t.descricao}
                      </td>
                      <td className="py-4 px-6 border-r border-brand-border text-center">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-none ${
                          t.tipo === 'Entrada' 
                            ? 'bg-brand-olive/10 border-brand-olive/20 text-brand-olive' 
                            : 'bg-brand-tinto/10 border-brand-tinto/20 text-brand-tinto'
                        }`}>
                          {t.tipo}
                        </span>
                      </td>
                      <td className={`py-4 px-6 border-r border-brand-border text-right font-bold ${
                        t.tipo === 'Entrada' ? 'text-brand-olive' : 'text-brand-tinto'
                      }`}>
                        R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 border-r border-brand-border">
                        <select
                          value={t.categoria}
                          disabled={t.alreadyExists || !t.selected}
                          onChange={(e) => handleCategoryChange(idx, e.target.value)}
                          className="w-full bg-brand-cream border border-brand-border text-xs px-2 py-1.5 focus:outline-none focus:border-brand-tinto cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed font-sans font-bold"
                        >
                          {t.tipo === 'Entrada' 
                            ? CATEGORIAS_ENTRADA.map(c => <option key={c} value={c}>{c}</option>)
                            : CATEGORIAS_SAIDA.map(c => <option key={c} value={c}>{c}</option>)
                          }
                        </select>
                      </td>
                      <td className="py-4 px-6 text-center text-[10px] font-bold uppercase tracking-wide">
                        {t.alreadyExists ? (
                          <span className="text-zinc-400 flex items-center justify-center gap-1">
                            <CheckCircle size={13} className="text-zinc-400 shrink-0" />
                            <span>Importado</span>
                          </span>
                        ) : t.selected ? (
                          <span className="text-brand-olive flex items-center justify-center gap-1">
                            <Check size={13} className="shrink-0" />
                            <span>Pronto</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 flex items-center justify-center gap-1">
                            <HelpCircle size={13} className="shrink-0 text-zinc-300" />
                            <span>Ignorado</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botão e Ações de Finalização */}
          <div className="flex justify-between items-center bg-brand-card border border-brand-border p-4 shadow-md">
            <button
              onClick={() => {
                setTransacoes([])
                setNomeArquivo('')
              }}
              className="border border-brand-tinto hover:bg-brand-cream text-brand-tinto py-2.5 px-4 text-xs font-serif font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0px_var(--brand-tinto)]"
            >
              Excluir Extrato Atual
            </button>

            <button
              onClick={handleImportSubmit}
              disabled={loading || totalSelecionadas === 0}
              className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-300 text-white py-3 px-6 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2.5px_2.5px_0px_var(--brand-ink)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_1.5px_0px_var(--brand-ink)] disabled:shadow-none flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Importar {totalSelecionadas} Lançamentos</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
