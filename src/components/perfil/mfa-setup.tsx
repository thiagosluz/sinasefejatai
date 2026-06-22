'use client'

import { useState } from 'react'
import { CheckCircle2, Copy, Loader2, QrCode, ShieldAlert, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { enrollMfa, unenrollMfa,verifyMfa } from '@/app/(admin)/admin/perfil/actions'

interface MfaSetupProps {
  enrolled: boolean
  factorId?: string
}

export function MfaSetup({ enrolled, factorId }: MfaSetupProps) {
  const [isEnrolled, setIsEnrolled] = useState(enrolled)
  const [currentFactorId, setCurrentFactorId] = useState(factorId)
  
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleEnroll = async () => {
    setIsEnrolling(true)
    const res = await enrollMfa()
    setIsEnrolling(false)

    if (!res.success) {
      toast.error(res.error)
      return
    }

    setQrCodeSvg(res.qrCode!)
    setSecret(res.secret!)
    setCurrentFactorId(res.factorId!)
  }

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.error('Digite o código de 6 dígitos.')
      return
    }

    setIsVerifying(true)
    const res = await verifyMfa(currentFactorId!, code)
    setIsVerifying(false)

    if (res.success) {
      toast.success(res.message)
      setIsEnrolled(true)
      setQrCodeSvg(null)
      setSecret(null)
    } else {
      toast.error(res.error)
    }
  }

  const handleUnenroll = async () => {
    if (!confirm('Tem certeza que deseja desativar a Autenticação de Dois Fatores? Sua conta ficará menos segura.')) return
    
    const res = await unenrollMfa(currentFactorId!)
    if (res.success) {
      toast.success(res.message)
      setIsEnrolled(false)
      setCurrentFactorId(undefined)
    } else {
      toast.error(res.error)
    }
  }

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      toast.success('Código copiado para a área de transferência.')
    }
  }

  return (
    <div className="border-2 border-brand-ink bg-white shadow-[4px_4px_0px_#121214] p-6">
      <div className="flex items-center gap-3 mb-6 border-b-2 border-brand-ink pb-4">
        {isEnrolled ? (
          <ShieldCheck className="text-green-600" size={28} />
        ) : (
          <ShieldAlert className="text-amber-500" size={28} />
        )}
        <div>
          <h2 className="text-lg font-serif font-bold text-brand-tinto uppercase tracking-tight">
            Autenticação de 2 Fatores (2FA)
          </h2>
          <p className="text-xs text-zinc-600 mt-1">
            {isEnrolled 
              ? 'Sua conta está protegida com uma camada extra de segurança.' 
              : 'Adicione uma camada extra de segurança à sua conta.'}
          </p>
        </div>
      </div>

      {isEnrolled ? (
        <div className="flex flex-col items-start gap-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm flex items-start gap-3 w-full">
            <CheckCircle2 className="mt-0.5 flex-shrink-0" size={18} />
            <p>
              <strong>2FA Ativado.</strong> No próximo login, você precisará inserir um código do seu aplicativo Autenticador.
            </p>
          </div>
          <button
            onClick={handleUnenroll}
            className="text-red-600 hover:text-red-700 font-bold text-sm underline underline-offset-4"
          >
            Desativar 2FA (Não recomendado)
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {!qrCodeSvg ? (
            <div>
              <p className="text-sm text-brand-ink mb-4">
                Recomendamos fortemente o uso de um aplicativo autenticador como <strong>Google Authenticator</strong> ou <strong>Authy</strong>.
              </p>
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="bg-brand-ink hover:bg-zinc-800 text-brand-cream font-bold text-xs uppercase tracking-wider py-3 px-6 transition-all border border-brand-ink shadow-[2px_2px_0px_var(--brand-tinto)] active:scale-98 hover:translate-x-[1px] hover:translate-y-[1px] flex items-center gap-2"
              >
                {isEnrolling ? <Loader2 className="animate-spin" size={16} /> : <QrCode size={16} />}
                Configurar Autenticador
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-brand-cream border border-brand-ink p-4 text-sm">
                <ol className="list-decimal pl-4 space-y-2 text-brand-ink font-medium">
                  <li>Abra seu aplicativo autenticador (Google Authenticator, Authy, etc).</li>
                  <li>Escaneie o QR Code abaixo ou insira o código manual.</li>
                  <li>Digite o código de 6 dígitos gerado pelo aplicativo.</li>
                </ol>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-white p-2 border-2 border-brand-ink shadow-[2px_2px_0px_#121214] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={qrCodeSvg} 
                    alt="QR Code Autenticador"
                    className="w-40 h-40 object-contain"
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">Código Manual</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-zinc-100 px-3 py-2 text-sm font-mono border border-zinc-300 w-full truncate">
                        {secret}
                      </code>
                      <button 
                        onClick={copySecret}
                        className="p-2 border border-brand-ink hover:bg-brand-card transition-colors"
                        title="Copiar código manual"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1" htmlFor="totpCode">
                      Código de 6 dígitos
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="totpCode"
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="bg-white border-2 border-brand-ink px-4 py-2 text-lg tracking-[0.5em] font-mono w-full md:w-48 focus:outline-none focus:border-brand-tinto text-center"
                      />
                      <button
                        onClick={handleVerify}
                        disabled={isVerifying || code.length !== 6}
                        className="bg-brand-tinto hover:bg-brand-tinto-light disabled:bg-zinc-400 text-white font-bold uppercase tracking-wider text-xs px-6 transition-all border border-brand-tinto disabled:border-zinc-400 shadow-[2px_2px_0px_#121214] disabled:shadow-none active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isVerifying ? <Loader2 className="animate-spin" size={16} /> : 'Verificar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
