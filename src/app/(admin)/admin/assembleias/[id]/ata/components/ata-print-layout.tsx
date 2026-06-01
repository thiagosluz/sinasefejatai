import DocumentHeader, { DocumentHeaderConfig } from '@/components/document-header'

interface Assembleia {
  numero: string | null
  tipo: string
}

interface AtaPrintLayoutProps {
  config?: DocumentHeaderConfig | null
  assembleia: Assembleia
  conteudoRich: string
  presidente: string
  redator: string
}

export function AtaPrintLayout({
  config,
  assembleia,
  conteudoRich,
  presidente,
  redator
}: AtaPrintLayoutProps) {
  return (
    <div className="hidden print:block font-serif text-black p-0 bg-white max-w-[800px] mx-auto text-justify text-sm leading-relaxed">
      <DocumentHeader config={config} />
      <div className="text-center font-bold text-base uppercase mb-6 tracking-wide">
        ATA DA ASSEMBLEIA GERAL {assembleia.tipo.toUpperCase()} {assembleia.numero ? `Nº ${assembleia.numero}` : ''}
      </div>
      <div
        className="print-document-content text-justify"
        dangerouslySetInnerHTML={{ __html: conteudoRich }}
        style={{ textAlign: 'justify', textJustify: 'inter-word', lineHeight: '1.8', fontSize: '13px' }}
      />
      {presidente && redator && presidente !== redator ? (
        <div className="mt-20 grid grid-cols-2 gap-12 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-[220px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">{redator}</div>
            <div className="text-gray-600">Secretário(a) da Assembleia</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[220px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">{presidente}</div>
            <div className="text-gray-600">Presidente da Mesa / Coordenador(a)</div>
          </div>
        </div>
      ) : (
        <div className="mt-20 flex justify-center text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-[280px] border-b border-black mb-2"></div>
            <div className="font-semibold uppercase">{presidente || redator || 'Presidente / Secretário(a)'}</div>
            <div className="text-gray-600">Presidente da Mesa e Secretário(a) da Assembleia</div>
          </div>
        </div>
      )}
    </div>
  )
}
