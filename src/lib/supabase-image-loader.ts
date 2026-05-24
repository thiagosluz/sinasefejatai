'use client'

export interface SupabaseLoaderProps {
  src: string
  width: number
  quality?: number
}

export default function supabaseLoader({ src, width, quality }: SupabaseLoaderProps): string {
  // Se a URL for vazia, local, ou um preview blob/base64 temporário, retorna diretamente
  if (!src || src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:')) {
    return src
  }

  try {
    const url = new URL(src)
    
    // Adiciona parâmetros de dimensionamento e conversão WebP do CDN do Supabase
    url.searchParams.set('width', width.toString())
    url.searchParams.set('quality', (quality || 75).toString())
    url.searchParams.set('format', 'webp')

    return url.toString()
  } catch {
    // Fallback de segurança se src for uma string de URL malformada
    return src
  }
}
