import { useState } from 'react'
import { Check, Trash2,X } from 'lucide-react'
import { toast } from 'sonner'

import { addTransacao, updateTransacao } from '../actions'

const CATEGORIAS_ENTRADA = [
  'Repasse Nacional',
  'Contribuição de Filiados',
  'Rendimentos',
  'Saldo de Abertura',
  'Outros'
]

const CATEGORIAS_SAIDA = [
  'Despesas com Viagens',
  'Material de Consumo',
  'Eventos/Mobilizações',
  'Serviços de Terceiros',
  'Despesas Administrativas',
  'Tarifas Bancárias',
  'Outros'
]

interface Transacao {
  id: string
  tipo: 'Entrada' | 'Saída'
  data: string
  descricao: string
  valor: number
  categoria: string
  comprovante_url: string | null
  created_at: string
}

interface FinanceiroFormDrawerProps {
  aberto: boolean
  onClose: () => void
  transacaoEmEdicao: Transacao | null
}

export function FinanceiroFormDrawer({ aberto, onClose, transacaoEmEdicao }: FinanceiroFormDrawerProps) {
  const [formTipo, setFormTipo] = useState<'Saída' | 'Entrada'>(transacaoEmEdicao ? transacaoEmEdicao.tipo : 'Saída')
  const [formCategoria, setFormCategoria] = useState(transacaoEmEdicao ? transacaoEmEdicao.categoria : CATEGORIAS_SAIDA[0])
  const [salvando, setSalvando] = useState(false)
  const [formData, setFormData] = useState({
    data: transacaoEmEdicao ? transacaoEmEdicao.data : new Date().toISOString().split('T')[0],
    descricao: transacaoEmEdicao ? transacaoEmEdicao.descricao : '',
    valor: transacaoEmEdicao ? Number(transacaoEmEdicao.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
  })
  const [manterComprovante, setManterComprovante] = useState(true)

  const handleFormTipoChange = (tipo: 'Entrada' | 'Saída') => {
    setFormTipo(tipo)
    setFormCategoria(tipo === 'Entrada' ? CATEGORIAS_ENTRADA[0] : CATEGORIAS_SAIDA[0])
  }

  const handleSubmit = async (formData: FormData) => {
    setSalvando(true)
    const result = transacaoEmEdicao 
      ? await updateTransacao(transacaoEmEdicao.id, formData)
      : await addTransacao(formData)
    
    setSalvando(false)
    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success(transacaoEmEdicao ? 'Lançamento atualizado!' : 'Lançamento registrado!')
      onClose()
    }
  }

  if (!aberto) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end print:hidden">
      <div className="flex-1" onClick={onClose}></div>
      
      <div className="w-full max-w-md bg-brand-cream border-l-2 border-brand-ink p-6 flex flex-col justify-between shadow-2xl relative animate-slide-left">
        <div>
          <div className="flex items-center justify-between border-b-2 border-brand-ink pb-4 mb-6">
            <h3 className="text-lg font-serif font-bold text-brand-tinto">
              {transacaoEmEdicao ? 'Editar Lançamento' : 'Lançar Movimentação'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-brand-card text-brand-ink/50 hover:text-brand-ink transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form 
            action={handleSubmit} 
            className="space-y-4"
          >
            <div>
              <span className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Tipo de Fluxo Contábil
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleFormTipoChange('Saída')}
                  className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                    formTipo === 'Saída'
                      ? 'border-brand-tinto bg-brand-tinto/10 text-brand-tinto shadow-inner'
                      : 'border-brand-border bg-brand-cream text-brand-ink/60 hover:text-brand-ink'
                  }`}
                >
                  Saída (Despesa)
                </button>
                <button
                  type="button"
                  onClick={() => handleFormTipoChange('Entrada')}
                  className={`py-3 text-center border font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                    formTipo === 'Entrada'
                      ? 'border-brand-olive bg-brand-olive/10 text-brand-olive shadow-inner'
                      : 'border-brand-border bg-brand-cream text-brand-ink/60 hover:text-brand-ink'
                  }`}
                >
                  Entrada (Receita)
                </button>
              </div>
              <input type="hidden" name="tipo" value={formTipo} />
            </div>

            <div>
              <label htmlFor="data" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Data do Lançamento
              </label>
              <input 
                id="data"
                name="data"
                type="date" 
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
                className="w-full bg-brand-card border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
              />
            </div>

            <div>
              <label htmlFor="descricao" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Descrição / Histórico
              </label>
              <input 
                id="descricao"
                name="descricao"
                type="text" 
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Aquisição de resmas de papel para assembleia"
                required
                className="w-full bg-brand-card border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto"
              />
            </div>

            <div>
              <label htmlFor="valor" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Valor (R$)
              </label>
              <input 
                id="valor"
                name="valor"
                type="text" 
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0,00"
                required
                className="w-full bg-brand-card border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto font-bold"
              />
            </div>

            <div>
              <label htmlFor="categoria" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formCategoria}
                onChange={(e) => setFormCategoria(e.target.value)}
                className="w-full bg-brand-card border border-brand-border rounded-none px-4 py-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto cursor-pointer"
              >
                {formTipo === 'Entrada' 
                  ? CATEGORIAS_ENTRADA.map(c => <option key={c} value={c}>{c}</option>)
                  : CATEGORIAS_SAIDA.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>

            {transacaoEmEdicao?.comprovante_url && (
              <div className="bg-brand-cream border border-brand-border p-3 flex flex-col gap-2 shadow-[1.5px_1.5px_0px_var(--brand-ink)]">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-brand-ink/60">Recibo Anexado</span>
                  {manterComprovante ? (
                    <span className="text-brand-olive flex items-center gap-1">
                      <Check size={11} /> Mantido
                    </span>
                  ) : (
                    <span className="text-brand-tinto flex items-center gap-1">
                      <Trash2 size={10} /> Será Removido
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-2">
                  <a 
                    href={transacaoEmEdicao.comprovante_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-brand-ink hover:text-brand-tinto font-bold underline uppercase"
                  >
                    Visualizar Recibo
                  </a>
                  {manterComprovante ? (
                    <button
                      type="button"
                      onClick={() => setManterComprovante(false)}
                      className="text-[9px] text-white bg-brand-tinto px-2 py-1 font-bold uppercase tracking-wider transition-colors cursor-pointer hover:bg-brand-tinto-light"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setManterComprovante(true)}
                      className="text-[9px] text-white bg-brand-olive px-2 py-1 font-bold uppercase tracking-wider transition-colors cursor-pointer hover:opacity-90"
                    >
                      Manter
                    </button>
                  )}
                </div>
                <input type="hidden" name="manterComprovante" value={manterComprovante ? 'true' : 'false'} />
              </div>
            )}

            <div>
              <label htmlFor="comprovante" className="block text-xs font-bold text-brand-ink/60 uppercase tracking-wider mb-2 font-serif">
                {transacaoEmEdicao?.comprovante_url ? 'Substituir Recibo' : 'Comprovante / Recibo (Opcional)'}
              </label>
              <input 
                id="comprovante"
                name="comprovante"
                type="file" 
                accept=".pdf,image/png,image/jpeg"
                className="w-full text-xs text-brand-ink/60 border border-brand-border bg-brand-card px-4 py-2.5 focus:outline-none focus:border-brand-tinto file:mr-4 file:py-1 file:px-2.5 file:border file:border-brand-border file:bg-brand-cream file:text-xs file:font-semibold file:text-brand-ink hover:file:bg-brand-card file:cursor-pointer cursor-pointer"
              />
              <span className="block text-[10px] text-brand-ink/50 mt-1">Formatos aceitos: PDF, PNG, JPEG. Limite de 5MB.</span>
            </div>

            <div className="pt-6 border-t border-dashed border-brand-border flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 border border-brand-ink hover:border-brand-ink bg-brand-cream text-brand-ink py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                data-testid="btn-confirmar-lancamento"
                disabled={salvando}
                className="flex-1 bg-brand-tinto hover:bg-brand-tinto-light text-white py-3 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_var(--brand-ink)]"
              >
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
