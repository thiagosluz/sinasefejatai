import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ModalProvider, useModal } from '../modal-provider';

function TestComponent() {
  const { alert, confirm } = useModal();

  return (
    <div>
      <button onClick={() => alert('Mensagem de Alerta')}>Abrir Alerta</button>
      <button onClick={async () => {
        const confirmed = await confirm('Tem certeza?');
        if (confirmed) {
          window.console.log('Confirmado');
        }
      }}>Abrir Confirm</button>
    </div>
  );
}

describe('ModalProvider', () => {
  it('deve renderizar os filhos normalmente', () => {
    render(
      <ModalProvider>
        <div data-testid="child">Conteudo Filho</div>
      </ModalProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('deve abrir o modal de alerta e fechar ao clicar ok', async () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    const alertBtn = screen.getByText('Abrir Alerta');
    await userEvent.click(alertBtn);

    expect(screen.getByText('Aviso')).toBeInTheDocument();
    expect(screen.getByText('Mensagem de Alerta')).toBeInTheDocument();

    const okBtn = screen.getByRole('button', { name: 'OK' });
    await userEvent.click(okBtn);

    expect(screen.queryByText('Mensagem de Alerta')).not.toBeInTheDocument();
  });

  it('deve abrir o modal de confirmacao e resolver true ao confirmar', async () => {
    const logSpy = vi.spyOn(window.console, 'log').mockImplementation(() => {});
    
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    const confirmBtn = screen.getByText('Abrir Confirm');
    await userEvent.click(confirmBtn);

    expect(screen.getByText('Confirmação')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();

    const okBtn = screen.getByRole('button', { name: 'Confirmar' });
    await userEvent.click(okBtn);

    expect(logSpy).toHaveBeenCalledWith('Confirmado');
    logSpy.mockRestore();
  });
});
