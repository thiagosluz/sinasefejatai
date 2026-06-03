import { Calendar, FileText, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react'
import Link from 'next/link'

import { Assinatura,DocumentoVerificacao } from '@/lib/actions-assinaturas'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AutenticarDocumentoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const cv = resolvedParams.cv as string | undefined
  const ca = resolvedParams.ca as string | undefined

  const hasParams = cv && ca
  let isValid = false
  let isCancelado = false
  let verificacao: DocumentoVerificacao | null = null
  let assinaturas: Assinatura[] = []

  if (hasParams) {
    const supabase = await createClient()

    // Busca a verificação pelos códigos exatos
    const { data: verif } = await supabase
      .from('documento_verificacoes')
      .select('*')
      .eq('codigo_verificador', cv)
      .eq('codigo_autenticacao', ca)
      .single()

    if (verif) {
      isValid = true
      verificacao = verif

      // Checa se o documento foi cancelado (por enquanto, implementado para recibos)
      if (verif.tipo_documento === 'recibo') {
        const { data: doc } = await supabase
          .from('documentos_administrativos')
          .select('status')
          .eq('id', verif.documento_id)
          .single()
        
        if (doc && doc.status === 'cancelado') {
          isCancelado = true
        }
      }

      // Busca as assinaturas correspondentes
      const { data: ass } = await supabase
        .from('documento_assinaturas')
        .select('*')
        .eq('verificacao_id', verif.id)
        .order('data_assinatura', { ascending: true })
      
      assinaturas = ass || []
    }
  }

  const formatData = (iso: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(iso))
  }

  const formatTipoDoc = (tipo: string) => {
    switch(tipo) {
      case 'ata': return 'Ata de Assembleia'
      case 'edital': return 'Edital de Convocação'
      case 'prestacao_caixa': return 'Prestação de Contas (Caixa)'
      default: return tipo.toUpperCase()
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 font-sans text-brand-ink">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-serif font-bold text-2xl tracking-tight text-brand-tinto uppercase mb-2">
            SINASEFE <span className="font-sans text-brand-ink text-sm">JATAÍ</span>
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-wider">Conferência de Autenticidade de Documentos</h1>
          <p className="mt-2 text-zinc-600">
            Verifique a validade de um documento oficial emitido pelo sistema do sindicato.
          </p>
        </div>

        <div className="bg-white border-2 border-brand-ink p-6 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          {/* Formulário de Busca */}
          <form className="mb-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cv" className="block text-xs font-bold uppercase tracking-wider mb-1">Código Verificador</label>
                <input 
                  type="text" 
                  id="cv" 
                  name="cv" 
                  defaultValue={cv} 
                  required
                  placeholder="Ex: 783341"
                  className="w-full px-4 py-3 border-2 border-brand-ink bg-brand-cream/50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-tinto transition-all font-mono"
                />
              </div>
              <div>
                <label htmlFor="ca" className="block text-xs font-bold uppercase tracking-wider mb-1">Código de Autenticação</label>
                <input 
                  type="text" 
                  id="ca" 
                  name="ca" 
                  defaultValue={ca} 
                  required
                  placeholder="Ex: 0f1d64c286"
                  className="w-full px-4 py-3 border-2 border-brand-ink bg-brand-cream/50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-tinto transition-all font-mono"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-brand-ink text-brand-cream font-bold uppercase tracking-wider hover:bg-brand-tinto transition-colors"
            >
              Consultar Documento
            </button>
          </form>

          {/* Resultado da Busca */}
          {hasParams && (
            <div className="border-t-2 border-dashed border-zinc-300 pt-8 mt-8">
              {isValid && verificacao ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {isCancelado ? (
                    <div className="flex flex-col items-center text-center mb-8 bg-red-50 p-6 border-2 border-red-200 rounded">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-red-700 uppercase tracking-wider">Documento Cancelado / Sem Validade</h2>
                      <p className="text-sm text-red-700 mt-2 max-w-md font-medium">
                        Este documento foi emitido e assinado eletronicamente pelo sindicato no passado, mas foi posteriormente CANCELADO no sistema. Ele não possui mais validade.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-green-700 uppercase tracking-wider">Documento Autêntico</h2>
                      <p className="text-sm text-zinc-600 mt-2 max-w-md">
                        Os códigos informados conferem com um documento original registrado na base de dados do SINASEFE JATAÍ.
                      </p>
                    </div>
                  )}

                  <div className={`bg-brand-cream/30 border border-zinc-200 rounded p-6 space-y-4 ${isCancelado ? 'opacity-75 grayscale' : ''}`}>
                    <div className="flex items-start gap-3">
                      <FileText className="text-brand-tinto shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-xs font-bold uppercase text-zinc-500">Tipo de Documento</p>
                        <p className="font-medium text-lg">{formatTipoDoc(verificacao.tipo_documento)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="text-brand-tinto shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-xs font-bold uppercase text-zinc-500">Data de Geração do Lacre</p>
                        <p className="font-medium">{formatData(verificacao.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-4 border-t border-zinc-200">
                      <UserCheck className="text-brand-tinto shrink-0 mt-0.5" size={20} />
                      <div className="w-full">
                        <p className="text-xs font-bold uppercase text-zinc-500 mb-2">Assinaturas Eletrônicas ({assinaturas.length})</p>
                        {assinaturas.length > 0 ? (
                          <div className="space-y-3">
                            {assinaturas.map((ass) => (
                              <div key={ass.id} className="bg-white p-3 border border-zinc-200 rounded text-sm">
                                <p className="font-bold">{ass.nome_assinante}</p>
                                <p className="text-zinc-600 text-xs">{ass.cargo_assinante}</p>
                                <p className="text-zinc-400 text-xs mt-1">Assinado em: {formatData(ass.data_assinatura)}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm italic text-zinc-500">Lacre gerado, aguardando assinaturas.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center text-center p-8 bg-red-50 border border-red-200 rounded">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-red-700 uppercase tracking-wider mb-2">Documento Não Encontrado ou Inválido</h2>
                  <p className="text-sm text-red-600/80 max-w-md">
                    Os códigos informados não correspondem a nenhum documento autêntico no nosso sistema. Verifique se você digitou corretamente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 text-xs text-zinc-500">
          <p>Esta página é pública e pode ser acessada por qualquer cidadão ou instituição para auditoria de documentos oficiais.</p>
        </div>
      </div>
    </div>
  )
}
