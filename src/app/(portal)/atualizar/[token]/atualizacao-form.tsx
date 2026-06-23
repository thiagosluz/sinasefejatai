'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile } from '@marsidev/react-turnstile'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { AtualizacaoFormData, AtualizacaoSchema } from '@/schemas/atualizacao-schema'

import { submeterAtualizacao } from './actions'

interface Props {
  token: string
  dadosAtuais: Partial<AtualizacaoFormData>
}

// Helper para máscaras
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

export function AtualizacaoForm({ token, dadosAtuais }: Props) {
  const [erro, setErro] = useState<string | null>(null)
  const [renderTime] = useState(() => Date.now().toString())
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AtualizacaoFormData>({
    resolver: zodResolver(AtualizacaoSchema),
    defaultValues: {
      nome: dadosAtuais.nome || '',
      email: dadosAtuais.email || '',
      telefone: dadosAtuais.telefone || '',
      siape: dadosAtuais.siape || '',
      unidade_lotacao: dadosAtuais.unidade_lotacao || '',
      campus: dadosAtuais.campus || '',
      categoria: dadosAtuais.categoria || 'Técnico Administrativo',
      situacao: dadosAtuais.situacao || 'Ativo',
      data_nascimento: dadosAtuais.data_nascimento || '',
      nome_pai: dadosAtuais.nome_pai || '',
      nome_mae: dadosAtuais.nome_mae || '',
      cpf: dadosAtuais.cpf ? maskCPF(dadosAtuais.cpf) : '',
      rg: dadosAtuais.rg || '',
      sexo: dadosAtuais.sexo || '',
      endereco_rua: dadosAtuais.endereco_rua || '',
      endereco_bairro: dadosAtuais.endereco_bairro || '',
      endereco_cep: dadosAtuais.endereco_cep ? maskCEP(dadosAtuais.endereco_cep) : '',
      endereco_cidade: dadosAtuais.endereco_cidade || '',
      endereco_estado: dadosAtuais.endereco_estado || '',
    }
  })

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const masked = maskCEP(rawValue)
    setValue('endereco_cep', masked, { shouldValidate: true })

    const cep = masked.replace(/\D/g, '')
    if (cep.length !== 8) return

    setBuscandoCep(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`)
      if (!res.ok) {
        toast.error('CEP não encontrado')
        return
      }
      
      const data = await res.json()
      if (data.street) setValue('endereco_rua', data.street, { shouldValidate: true })
      if (data.neighborhood) setValue('endereco_bairro', data.neighborhood, { shouldValidate: true })
      if (data.city) setValue('endereco_cidade', data.city, { shouldValidate: true })
      if (data.state) setValue('endereco_estado', data.state, { shouldValidate: true })
    } catch (error) {
      console.error(error)
      toast.error('Erro ao buscar o CEP')
    } finally {
      setBuscandoCep(false)
    }
  }

  const onSubmit = async (data: AtualizacaoFormData) => {
    setErro(null)
    const res = await submeterAtualizacao(token, data, turnstileToken)

    if (res?.success) {
      toast.success('Atualização enviada com sucesso!')
    } else if (res?.error) {
      setErro(res.error)
      toast.error(res.error)
    }
  }

  return (
    <>
      {erro && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle size={18} className="text-brand-tinto flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="hidden" aria-hidden="true">
          <input type="text" {...register('website')} tabIndex={-1} autoComplete="off" />
          <input type="hidden" {...register('timestamp')} value={renderTime} />
        </div>

        {/* --- DADOS DO SERVIDOR --- */}
        <fieldset className="border border-brand-border-muted rounded-2xl p-5 bg-zinc-50/50">
          <legend className="px-3 text-sm font-bold text-brand-tinto uppercase tracking-widest bg-white rounded-full border border-brand-border-muted py-1">
            Dados do Servidor
          </legend>

          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-brand-ink mb-1.5">Nome Completo <span className="text-brand-tinto">*</span></label>
                <input id="nome" {...register('nome')} disabled={isSubmitting} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 ${errors.nome ? 'border-brand-tinto' : 'border-brand-border'}`} />
                {errors.nome && <p className="mt-1 text-xs text-brand-tinto">{errors.nome.message}</p>}
              </div>
              <div>
                <label htmlFor="data_nascimento" className="block text-sm font-medium text-brand-ink mb-1.5">Data de Nascimento</label>
                <input id="data_nascimento" type="date" {...register('data_nascimento')} disabled={isSubmitting} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border`} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-brand-ink mb-1.5 flex justify-between items-center">
                  CPF <span className="text-[10px] font-normal text-brand-tinto px-2 py-0.5 bg-red-50 rounded-full border border-red-100">Somente Leitura</span>
                </label>
                <input
                  id="cpf"
                  {...register('cpf')}
                  readOnly
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-zinc-100 text-zinc-500 border-brand-border cursor-not-allowed opacity-80" />
              </div>
              <div>
                <label htmlFor="rg" className="block text-sm font-medium text-brand-ink mb-1.5">RG</label>
                <input id="rg" {...register('rg')} disabled={isSubmitting} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border`} />
              </div>
              <div>
                <label htmlFor="siape" className="block text-sm font-medium text-brand-ink mb-1.5 flex justify-between items-center">
                  Matrícula SIAPE <span className="text-[10px] font-normal text-brand-tinto px-2 py-0.5 bg-red-50 rounded-full border border-red-100">Somente Leitura</span>
                </label>
                <input 
                  id="siape" 
                  {...register('siape')} 
                  readOnly 
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-zinc-100 text-zinc-500 border-brand-border cursor-not-allowed opacity-80" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome_pai" className="block text-sm font-medium text-brand-ink mb-1.5">Nome do Pai</label>
                <input id="nome_pai" {...register('nome_pai')} disabled={isSubmitting} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border`} />
              </div>
              <div>
                <label htmlFor="nome_mae" className="block text-sm font-medium text-brand-ink mb-1.5">Nome da Mãe</label>
                <input id="nome_mae" {...register('nome_mae')} disabled={isSubmitting} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border`} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="unidade_lotacao" className="block text-sm font-medium text-brand-ink mb-1.5">Unidade de Lotação</label>
                <input id="unidade_lotacao" {...register('unidade_lotacao')} disabled={isSubmitting} placeholder="Ex: Departamento de TI" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border`} />
              </div>
              <div>
                <label htmlFor="campus" className="block text-sm font-medium text-brand-ink mb-1.5">Campus / Cargo</label>
                <input id="campus" {...register('campus')} disabled={isSubmitting} placeholder="Ex: IFG Jataí / Professor" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border`} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <p className="block text-sm font-medium text-brand-ink mb-3">Categoria <span className="text-brand-tinto">*</span></p>
                <div className="flex gap-4">
                  {['Técnico Administrativo', 'Docente'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={cat} {...register('categoria')} disabled={isSubmitting} className="w-4 h-4 accent-brand-tinto" />
                      <span className="text-sm text-zinc-700">{cat}</span>
                    </label>
                  ))}
                </div>
                {errors.categoria && <p className="mt-1 text-xs text-brand-tinto">{errors.categoria.message}</p>}
              </div>
              <div>
                <p className="block text-sm font-medium text-brand-ink mb-3">Situação <span className="text-brand-tinto">*</span></p>
                <div className="flex gap-4">
                  {['Ativo', 'Aposentado'].map((sit) => (
                    <label key={sit} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={sit} {...register('situacao')} disabled={isSubmitting} className="w-4 h-4 accent-brand-tinto" />
                      <span className="text-sm text-zinc-700">{sit}</span>
                    </label>
                  ))}
                </div>
                {errors.situacao && <p className="mt-1 text-xs text-brand-tinto">{errors.situacao.message}</p>}
              </div>
            </div>
          </div>
        </fieldset>

        {/* --- DADOS COMPLEMENTARES --- */}
        <fieldset className="border border-brand-border-muted rounded-2xl p-5 bg-zinc-50/50">
          <legend className="px-3 text-sm font-bold text-brand-tinto uppercase tracking-widest bg-white rounded-full border border-brand-border-muted py-1">
            Dados Complementares
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div className="sm:col-span-1">
              <label htmlFor="sexo" className="block text-sm font-medium text-brand-ink mb-1.5">Sexo</label>
              <select id="sexo" {...register('sexo')} disabled={isSubmitting} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border">
                <option value="">Selecione...</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-brand-ink mb-1.5">E-mail <span className="text-brand-tinto">*</span></label>
              <input id="email" type="email" {...register('email')} disabled={isSubmitting} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 ${errors.email ? 'border-brand-tinto' : 'border-brand-border'}`} />
              {errors.email && <p className="mt-1 text-xs text-brand-tinto">{errors.email.message}</p>}
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="telefone" className="block text-sm font-medium text-brand-ink mb-1.5">Telefone / Celular</label>
              <input id="telefone" type="tel" {...register('telefone')} disabled={isSubmitting} placeholder="(64) 99999-9999" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border" />
            </div>
          </div>
        </fieldset>

        {/* --- ENDEREÇO --- */}
        <fieldset className="border border-brand-border-muted rounded-2xl p-5 bg-zinc-50/50">
          <legend className="px-3 text-sm font-bold text-brand-tinto uppercase tracking-widest bg-white rounded-full border border-brand-border-muted py-1">
            Endereço
          </legend>

          <div className="space-y-4 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label htmlFor="endereco_rua" className="block text-sm font-medium text-brand-ink mb-1.5">Rua / Logradouro</label>
                <input id="endereco_rua" {...register('endereco_rua')} disabled={isSubmitting} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border" />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="endereco_cep" className="block text-sm font-medium text-brand-ink mb-1.5">CEP</label>
                <div className="relative">
                  <input
                    id="endereco_cep"
                    {...register('endereco_cep')}
                    onChange={handleCepChange}
                    disabled={isSubmitting || buscandoCep}
                    placeholder="00000-000"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border" />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 font-medium">
                  {buscandoCep ? (
                    <span className="text-brand-tinto flex items-center gap-1">
                      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-tinto"></span>
                      Buscando endereço...
                    </span>
                  ) : (
                    'Preenchimento automático'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="endereco_bairro" className="block text-sm font-medium text-brand-ink mb-1.5">Bairro</label>
                <input id="endereco_bairro" {...register('endereco_bairro')} disabled={isSubmitting} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border" />
              </div>
              <div>
                <label htmlFor="endereco_cidade" className="block text-sm font-medium text-brand-ink mb-1.5">Cidade</label>
                <input id="endereco_cidade" {...register('endereco_cidade')} disabled={isSubmitting} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border" />
              </div>
              <div>
                <label htmlFor="endereco_estado" className="block text-sm font-medium text-brand-ink mb-1.5">Estado</label>
                <select id="endereco_estado" {...register('endereco_estado')} disabled={isSubmitting} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-tinto/30 focus:border-brand-tinto bg-white disabled:opacity-50 border-brand-border">
                  <option value="">UF...</option>
                  <option value="GO">Goiás</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="TO">Tocantins</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="PR">Paraná</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="BA">Bahia</option>
                  <option value="PB">Paraíba</option>
                  <option value="PE">Pernambuco</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="CE">Ceará</option>
                  <option value="PI">Piauí</option>
                  <option value="MA">Maranhão</option>
                  <option value="PA">Pará</option>
                  <option value="AM">Amazonas</option>
                  <option value="AP">Amapá</option>
                  <option value="RR">Roraima</option>
                  <option value="RO">Rondônia</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="SE">Sergipe</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        <div className="pt-2">
          <div className="flex justify-center mb-6">
            <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
          </div>

          <button
            id="submit-atualizacao"
            type="submit"
            disabled={isSubmitting || !turnstileToken}
            className="w-full bg-brand-tinto text-white font-bold py-4 rounded-xl hover:bg-brand-tinto-light transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processando...' : 'Salvar e Enviar para Análise'}
          </button>
          <p className="text-xs text-zinc-400 text-center mt-3">
            Suas alterações não serão aplicadas imediatamente. Elas passarão por uma verificação da diretoria para evitar fraudes.
          </p>
        </div>
      </form>
    </>
  )
}
