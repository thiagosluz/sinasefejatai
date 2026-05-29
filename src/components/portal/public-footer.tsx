import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Mail, Calendar } from 'lucide-react'

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Identidade */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-tinto flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold font-serif">S</span>
              </div>
              <div>
                <p className="text-white font-bold font-serif text-sm">SINASEFE Jataí</p>
                <p className="text-zinc-400 text-xs">Seção Sindical</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Representando e defendendo os servidores federais da educação desde{' '}
              {config?.fundacao?.replace('FUNDADO EM ', '') ?? '2005'}.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Links Rápidos</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Início' },
                { href: '/diretoria', label: 'Diretoria' },
                { href: '/assembleias', label: 'Assembleias' },
                { href: '/filiacao', label: 'Filiação' },
                { href: '/contato', label: 'Fale Conosco' },
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
          <div>
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
                  href="mailto:sinasefe.jatai@gmail.com"
                  className="text-sm text-zinc-400 hover:text-brand-tinto transition-colors"
                >
                  sinasefe.jatai@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Calendar size={15} className="text-brand-tinto flex-shrink-0" />
                <span className="text-sm text-zinc-400">Seg–Sex, 8h às 17h</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {config?.secao_sindical ?? 'SINASEFE Jataí'}. Todos os direitos reservados.
          </p>
          <div className="w-8 h-0.5 bg-brand-tinto rounded" />
        </div>
      </div>
    </footer>
  )
}
