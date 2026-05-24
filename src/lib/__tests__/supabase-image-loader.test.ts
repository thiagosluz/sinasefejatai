import { describe, it, expect } from 'vitest';
import supabaseLoader from '@/lib/supabase-image-loader';

describe('supabase-image-loader', () => {
  it('deve retornar caminhos locais inalterados', () => {
    const src = '/images/local-logo.png';
    const result = supabaseLoader({ src, width: 100 });
    expect(result).toBe(src);
  });

  it('deve retornar URLs do tipo blob inalteradas', () => {
    const src = 'blob:http://localhost:3000/1234-5678';
    const result = supabaseLoader({ src, width: 100 });
    expect(result).toBe(src);
  });

  it('deve retornar URLs do tipo data inalteradas', () => {
    const src = 'data:image/png;base64,iVBORw0KGgo';
    const result = supabaseLoader({ src, width: 100 });
    expect(result).toBe(src);
  });

  it('deve retornar a própria string se estiver vazia', () => {
    const src = '';
    const result = supabaseLoader({ src, width: 100 });
    expect(result).toBe(src);
  });

  it('deve injetar parâmetros do CDN do Supabase em URLs válidas (width, quality, format)', () => {
    const src = 'https://meu-projeto.supabase.co/storage/v1/object/public/sistema/logo.png';
    const result = supabaseLoader({ src, width: 200, quality: 80 });
    
    // Verifica se os parâmetros foram injetados corretamente como search params
    const url = new URL(result);
    expect(url.searchParams.get('width')).toBe('200');
    expect(url.searchParams.get('quality')).toBe('80');
    expect(url.searchParams.get('format')).toBe('webp');
    // Verifica se a base da URL foi mantida
    expect(url.origin + url.pathname).toBe(src);
  });

  it('deve utilizar quality padrão (75) quando não for fornecida', () => {
    const src = 'https://exemplo.com/imagem.jpg';
    const result = supabaseLoader({ src, width: 300 });
    
    const url = new URL(result);
    expect(url.searchParams.get('width')).toBe('300');
    expect(url.searchParams.get('quality')).toBe('75');
    expect(url.searchParams.get('format')).toBe('webp');
  });

  it('deve retornar a própria string original se a URL for malformada e causar erro no parse', () => {
    // String que não começa com barra nem é URL válida, lançaria throw no new URL()
    const src = 'invalid-url-format-without-protocol';
    const result = supabaseLoader({ src, width: 100 });
    expect(result).toBe(src);
  });
});
