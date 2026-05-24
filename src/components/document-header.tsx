import React from 'react'
import Image from 'next/image'
import supabaseLoader from '@/lib/supabase-image-loader'

export interface DocumentHeaderConfig {
  titulo: string
  secao_sindical: string
  endereco: string
  cep: string
  filiacao: string
  fundacao: string
  logo_url: string | null
}

interface DocumentHeaderProps {
  config?: DocumentHeaderConfig | null
}

export default function DocumentHeader({ config }: DocumentHeaderProps) {
  // Se não houver configuração, usa os padrões oficiais do SINASEFE Jataí
  const c = config || {
    titulo: 'SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA',
    secao_sindical: 'SINASEFE - SEÇÃO SINDICAL JATAÍ',
    endereco: 'RUA RIACHUELO, 2090 – SETOR SAMUEL GRAHAM – JATAÍ/GO',
    cep: 'CEP: 75804-020',
    filiacao: 'FILIADO À CEA',
    fundacao: 'FUNDADO EM 16/05/2005',
    logo_url: null,
  }

  return (
    <div className="w-full flex flex-col font-sans mb-8">
      {/* Parte superior: Logo à esquerda, Texto à direita */}
      <div className="flex items-center gap-6 pb-3">
        {/* Logotipo */}
        <div className="shrink-0 flex items-center justify-center">
          {c.logo_url ? (
            <Image
              loader={supabaseLoader}
              src={c.logo_url}
              alt="Logo Seção Sindical"
              width={120}
              height={64}
              priority
              className="h-16 w-auto max-w-[120px] object-contain print:h-16"
            />
          ) : (
            // Fallback emblemático e geométrico (Sem ser genérico)
            <div className="w-16 h-16 bg-[#b91c1c] text-white flex flex-col items-center justify-center font-black rounded-none select-none shadow-sm print:shadow-none shrink-0 border border-red-800">
              <span className="text-xl leading-none tracking-tighter">S</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-red-200 mt-0.5">JATAÍ</span>
            </div>
          )}
        </div>

        {/* Informações Institucionais do Cabeçalho */}
        <div className="flex-1 flex flex-col justify-center text-left">
          <h1 className="text-[12px] md:text-[13px] font-bold text-zinc-800 leading-tight uppercase tracking-wide">
            {c.titulo}
          </h1>
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#b91c1c] leading-snug uppercase tracking-wider mt-0.5">
            {c.secao_sindical}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-500 font-medium uppercase mt-1">
            <span>{c.endereco}</span>
            <span className="hidden md:inline text-zinc-300">•</span>
            <span>{c.cep}</span>
          </div>
        </div>
      </div>

      {/* Linha Divisória com Filiação e Fundação */}
      <div className="w-full">
        {/* Linha fina cinza */}
        <div className="w-full h-[1px] bg-zinc-300" />
        <div className="flex justify-between items-center mt-1.5 text-[9px] font-bold tracking-widest uppercase">
          {/* Filiação em Destaque Vermelho Sublinhado */}
          <span className="text-[#b91c1c] border-b border-[#b91c1c] pb-0.5 select-none font-extrabold">
            {c.filiacao}
          </span>
          {/* Fundação em Cinza Elegante */}
          <span className="text-zinc-500 font-semibold select-none">
            {c.fundacao}
          </span>
        </div>
      </div>
    </div>
  )
}
