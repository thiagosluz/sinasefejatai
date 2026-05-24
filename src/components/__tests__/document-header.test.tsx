import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DocumentHeader from '@/components/document-header';

describe('DocumentHeader', () => {
  it('deve renderizar os textos configurados corretamente', () => {
    render(
      <DocumentHeader
        config={{
          titulo: 'SINDICATO NACIONAL',
          secao_sindical: 'SEÇÃO SINDICAL JATAÍ',
          endereco: 'RUA TESTE, 123',
          cep: '75800-000',
          filiacao: 'FILIADO A FASE',
          fundacao: 'FUNDADO EM 2000',
          logo_url: null,
        }}
      />
    );

    expect(screen.getByText('SINDICATO NACIONAL')).toBeInTheDocument();
    expect(screen.getByText('SEÇÃO SINDICAL JATAÍ')).toBeInTheDocument();
    expect(screen.getByText('RUA TESTE, 123')).toBeInTheDocument();
  });

  it('deve renderizar a imagem quando a url é fornecida', () => {
    const { container } = render(
      <DocumentHeader
        config={{
          titulo: 'Texto 1',
          secao_sindical: 'Texto 2',
          endereco: 'Texto 3',
          cep: '123',
          filiacao: 'F',
          fundacao: 'F',
          logo_url: 'https://exemplo.com/logo.png',
        }}
      />
    );

    // O Next Image usa a tag img e nós mockamos isso no vitest-setup
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image?.getAttribute('src')).toBe('https://exemplo.com/logo.png');
  });

  it('deve renderizar com as configurações padrão (fallback) quando config não é fornecida', () => {
    render(<DocumentHeader config={null} />);
    
    // Verifica os textos oficias padrões do SINASEFE
    expect(screen.getByText('SINDICATO NACIONAL DOS SERVIDORES FEDERAIS DA EDUCAÇÃO BÁSICA, PROFISSIONAL E TECNOLÓGICA')).toBeInTheDocument();
    expect(screen.getByText('SINASEFE - SEÇÃO SINDICAL JATAÍ')).toBeInTheDocument();
    
    // Verifica o render da logo de fallback geométrica
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('JATAÍ')).toBeInTheDocument();
  });
});
