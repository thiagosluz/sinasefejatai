import {
  Award,
  Banknote,
  FileSignature,
  Gavel,
  type LucideIcon,
  Mail,
  ScrollText,
} from 'lucide-react'

export interface TipoDocumentoConfig {
  label: string
  slug: string
  icon: LucideIcon
  descricao: string
  prefixoNumero: string
}

export const TIPOS_DOCUMENTO: Record<string, TipoDocumentoConfig> = {
  recibo_pagamento: {
    label: 'Recibo',
    slug: 'recibos',
    icon: Banknote,
    descricao: 'Recibo oficial com cálculo automático de valor por extenso, para pagamentos de diárias, serviços ou auxílios.',
    prefixoNumero: 'Recibo',
  },
  oficio: {
    label: 'Ofício',
    slug: 'oficios',
    icon: FileSignature,
    descricao: 'Comunicação oficial com órgãos externos, reitoria, empresas e entidades públicas.',
    prefixoNumero: 'Ofício',
  },
  memorando: {
    label: 'Memorando',
    slug: 'memorandos',
    icon: Mail,
    descricao: 'Comunicação interna entre setores, comissões e membros da diretoria.',
    prefixoNumero: 'Memorando',
  },
  declaracao: {
    label: 'Declaração',
    slug: 'declaracoes',
    icon: ScrollText,
    descricao: 'Declarações para comprovação de vínculo, filiação, participação ou outros fatos.',
    prefixoNumero: 'Declaração',
  },
  certificado: {
    label: 'Certificado',
    slug: 'certificados',
    icon: Award,
    descricao: 'Certificados de participação em eventos, cursos, seminários e congressos.',
    prefixoNumero: 'Certificado',
  },
  portaria: {
    label: 'Portaria',
    slug: 'portarias',
    icon: Gavel,
    descricao: 'Portarias para designações, nomeações e delegações internas.',
    prefixoNumero: 'Portaria',
  },
}

export function getTipoBySlug(slug: string): { key: string; config: TipoDocumentoConfig } | null {
  const entry = Object.entries(TIPOS_DOCUMENTO).find(([, config]) => config.slug === slug)
  if (!entry) return null
  return { key: entry[0], config: entry[1] }
}

export function formatarTipo(tipo: string): string {
  return TIPOS_DOCUMENTO[tipo]?.label || tipo.replace(/_/g, ' ')
}

export function getSlugByTipo(tipo: string): string {
  return TIPOS_DOCUMENTO[tipo]?.slug || tipo
}
