import { ArrowRight, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

import { EMAIL_SINDICATO, INSTAGRAM_SINDICATO } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

async function getConfiguracoes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('configuracoes')
    .select('secao_sindical, endereco, cep, fundacao')
    .eq('id', 1)
    .single()
  return data
}

export async function PublicFooter() {
  const config = await getConfiguracoes()

  return (
    <footer className="bg-zinc-900 text-zinc-300">
      {/* CTA Banner */}
      <div className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold font-serif text-xl sm:text-2xl mb-1">
                Faça parte do SINASEFE Jataí
              </h3>
              <p className="text-zinc-400 text-sm">
                Junte-se a nós na defesa dos servidores federais.
              </p>
            </div>
            <Link
              href="/filiacao"
              className="inline-flex items-center gap-2 bg-brand-tinto hover:bg-brand-tinto-light text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm flex-shrink-0"
            >
              Filiar-se Agora
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com texto de fundo */}
      <div className="relative overflow-hidden">
        {/* Texto SINASEFE de fundo */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="text-[12rem] sm:text-[16rem] md:text-[20rem] font-bold font-serif text-white/[0.03] tracking-widest whitespace-nowrap leading-none"
            style={{ letterSpacing: '0.15em' }}
          >
            SINASEFE
          </span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Identidade + Redes Sociais */}
            <div className="md:col-span-4 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-tinto flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold font-serif">S</span>
                </div>
                <div>
                  <p className="text-white font-bold font-serif text-sm">SINASEFE JATAÍ</p>
                  <p className="text-zinc-500 text-xs">Seção Sindical</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Representando e defendendo os servidores federais da educação desde{' '}
                {config?.fundacao?.replace('FUNDADO EM ', '') ?? '2005'}.
              </p>

              {/* Redes Sociais */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={INSTAGRAM_SINDICATO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={17} />
                </a>
                <a
                  href={`mailto:${EMAIL_SINDICATO}`}
                  className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-brand-tinto flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  aria-label="E-mail"
                >
                  <Mail size={17} />
                </a>
              </div>
            </div>

            {/* Links rápidos */}
            <div className="md:col-span-4">
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Links Rápidos</h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { href: '/', label: 'Início' },
                  { href: '/diretoria', label: 'Diretoria' },
                  { href: '/assembleias', label: 'Assembleias' },
                  { href: '/documentos', label: 'Documentos' },
                  { href: '/boletins', label: 'Boletins' },
                  { href: '/contato', label: 'Contato' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 hover:text-brand-tinto transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div className="md:col-span-4">
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contato</h3>
              <ul className="space-y-3">
                {config?.endereco && (
                  <li className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-brand-tinto mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-400 leading-relaxed">
                      {config.endereco}
                      {config.cep && <><br />{config.cep}</>}
                    </span>
                  </li>
                )}
                <li className="flex items-center gap-2.5">
                  <Mail size={15} className="text-brand-tinto flex-shrink-0" />
                  <a
                    href={`mailto:${EMAIL_SINDICATO}`}
                    className="text-sm text-zinc-400 hover:text-brand-tinto transition-colors"
                  >
                    {EMAIL_SINDICATO}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-brand-tinto flex-shrink-0"><InstagramIcon size={15} /></span>
                  <a
                    href={INSTAGRAM_SINDICATO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 hover:text-brand-tinto transition-colors"
                  >
                    @sinasefejatai
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Linha divisória + copyright */}
          <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} {config?.secao_sindical ?? 'SINASEFE JATAÍ'}. Todos os direitos reservados.
            </p>
            <div className="w-8 h-0.5 bg-brand-tinto rounded" />
          </div>
        </div>
      </div>
    </footer>
  )
}
