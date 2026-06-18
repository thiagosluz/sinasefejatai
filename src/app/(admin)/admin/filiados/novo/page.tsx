'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { addFiliado } from '../actions'

export default function NovoFiliadoPage() {
  const [loading, setLoading] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await addFiliado(formData)
    setLoading(false)

    if (res?.success) {
      toast.success('Filiado cadastrado com sucesso!')
      router.push('/admin/filiados')
    } else if (res?.error) {
      toast.error(res.error)
    }
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return

    setBuscandoCep(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`)
      if (!res.ok) {
        toast.error('CEP não encontrado')
        return
      }
      
      const data = await res.json()
      
      const inputRua = document.getElementById('endereco_rua') as HTMLInputElement
      const inputBairro = document.getElementById('endereco_bairro') as HTMLInputElement
      const inputCidade = document.getElementById('endereco_cidade') as HTMLInputElement
      const inputEstado = document.getElementById('endereco_estado') as HTMLInputElement

      if (inputRua && data.street) inputRua.value = data.street
      if (inputBairro && data.neighborhood) inputBairro.value = data.neighborhood
      if (inputCidade && data.city) inputCidade.value = data.city
      if (inputEstado && data.state) inputEstado.value = data.state

    } catch (error) {
      console.error(error)
      toast.error('Erro ao buscar o CEP')
    } finally {
      setBuscandoCep(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink p-6 md:p-8 font-sans selection:bg-brand-tinto selection:text-white">
      <header className="max-w-2xl mx-auto mb-8">
        <Link href="/admin/filiados" className="text-zinc-550 hover:text-brand-ink transition-colors mb-4 inline-block font-semibold text-xs uppercase tracking-wider">&larr; Voltar para lista</Link>
        <h1 className="text-3xl font-serif font-bold text-brand-tinto tracking-tight">Nova Ficha de Filiado</h1>
        <p className="text-zinc-600 text-xs mt-1 uppercase tracking-wider">Abertura de Cadastro na Seção Sindical</p>
      </header>

      <div className="max-w-2xl mx-auto bg-brand-card border border-zinc-350 shadow-2xl p-1">
        <div className="border border-dashed border-zinc-300">
          <form action={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-8">
              
              {/* --- DADOS DO SERVIDOR --- */}
              <div className="border-b border-dashed border-zinc-300 pb-6">
                <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-brand-tinto mb-4">Dados do Servidor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Nome Completo *</label>
                    <input id="nome" name="nome" required disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="data_nascimento" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Data de Nasc.</label>
                    <input id="data_nascimento" name="data_nascimento" type="date" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cpf" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">CPF</label>
                    <input id="cpf" name="cpf" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rg" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">RG</label>
                    <input id="rg" name="rg" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="siape" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Matrícula SIAPE *</label>
                    <input id="siape" name="siape" required disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nome_pai" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Nome do Pai</label>
                    <input id="nome_pai" name="nome_pai" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="nome_mae" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Nome da Mãe</label>
                    <input id="nome_mae" name="nome_mae" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="categoria" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Categoria</label>
                    <select id="categoria" name="categoria" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto">
                      <option value="">Selecione...</option>
                      <option value="Técnico Administrativo">Técnico Administrativo</option>
                      <option value="Docente">Docente</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="situacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Situação</label>
                    <select id="situacao" name="situacao" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto">
                      <option value="">Selecione...</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Aposentado">Aposentado</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cargo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Cargo / Função</label>
                    <input id="cargo" name="cargo" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="unidade_lotacao" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Lotação</label>
                    <input id="unidade_lotacao" name="unidade_lotacao" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="campus" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Campus</label>
                    <input id="campus" name="campus" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                </div>
              </div>

              {/* --- DADOS COMPLEMENTARES --- */}
              <div className="border-b border-dashed border-zinc-300 pb-6">
                <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-brand-tinto mb-4">Dados Complementares</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">E-mail</label>
                    <input id="email" name="email" type="email" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="telefone" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Telefone / Celular</label>
                    <input id="telefone" name="telefone" type="tel" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sexo" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Sexo</label>
                    <select id="sexo" name="sexo" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto">
                      <option value="">Selecione...</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* --- ENDEREÇO --- */}
              <div>
                <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-brand-tinto mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label htmlFor="endereco_rua" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Rua / Logradouro</label>
                    <input id="endereco_rua" name="endereco_rua" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="endereco_cep" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">CEP</label>
                    <div className="relative">
                      <input 
                        id="endereco_cep" 
                        name="endereco_cep" 
                        disabled={loading || buscandoCep} 
                        onChange={handleCepChange}
                        className="w-full bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {buscandoCep ? (
                        <span className="text-brand-tinto flex items-center gap-1">
                          <span className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-brand-tinto"></span>
                          Buscando...
                        </span>
                      ) : (
                        'Preenchimento automático'
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="endereco_bairro" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Bairro</label>
                    <input id="endereco_bairro" name="endereco_bairro" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="endereco_cidade" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Cidade</label>
                    <input id="endereco_cidade" name="endereco_cidade" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="endereco_estado" className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-serif">Estado</label>
                    <input id="endereco_estado" name="endereco_estado" maxLength={2} placeholder="UF" disabled={loading} className="bg-brand-cream border border-zinc-350 px-4 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-tinto" />
                  </div>
                </div>
              </div>

            </div>

            {/* Ações */}
            <div className="pt-6 mt-2 border-t border-dashed border-zinc-300 flex flex-col sm:flex-row justify-end items-center gap-4">
              <div className="flex gap-3 w-full sm:w-auto">
                <Link 
                  href="/admin/filiados"
                  className="flex-1 sm:flex-none text-center border border-brand-ink bg-brand-cream hover:bg-brand-card text-brand-ink py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#121214] hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  Cancelar
                </Link>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:w-auto bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white text-xs font-serif font-bold uppercase tracking-wider py-3.5 px-6 transition-all shadow-[2px_2px_0px_#121214] disabled:shadow-none hover:shadow-[1px_1px_0px_#121214] hover:translate-x-[1px] hover:translate-y-[1px] disabled:translate-x-0 disabled:translate-y-0 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Salvar Ficha \u2192'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
