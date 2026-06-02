import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import { render } from '@/tests/test-utils'

import { FinanceiroFormDrawer } from '../financeiro-form-drawer'

// Evitar que o toast quebre no teste (caso não renderize no JSDOM sem act)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock das Actions que seriam chamadas pelo form action
const mockAddTransacao = vi.fn()
vi.mock('../../actions', () => ({
  addTransacao: (...args: unknown[]) => mockAddTransacao(...args),
  updateTransacao: vi.fn()
}))

describe('FinanceiroFormDrawer (Integração UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddTransacao.mockResolvedValue({ success: true })
  })

  it('não deve renderizar nada se aberto for false', () => {
    const { container } = render(
      <FinanceiroFormDrawer aberto={false} onClose={vi.fn()} transacaoEmEdicao={null} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('deve alternar as opções de categoria ao mudar de Saída para Entrada', async () => {
    const user = userEvent.setup()
    render(
      <FinanceiroFormDrawer aberto={true} onClose={vi.fn()} transacaoEmEdicao={null} />
    )

    // Por padrão é saída, então deve ter categorias de saída (ex: Despesas com Viagens)
    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument()
    expect(screen.getByText('Despesas Administrativas')).toBeInTheDocument()
    
    // Clica para mudar pra entrada
    const btnEntrada = screen.getByRole('button', { name: /Entrada \(Receita\)/i })
    await user.click(btnEntrada)

    // Verifica se as opções de Saída sumiram e apareceram as de Entrada
    expect(screen.queryByText('Despesas Administrativas')).not.toBeInTheDocument()
    expect(screen.getByText('Contribuição de Filiados')).toBeInTheDocument()
  })

  it('deve simular digitação e acionar o botão de confirmar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <FinanceiroFormDrawer aberto={true} onClose={onClose} transacaoEmEdicao={null} />
    )

    // Digita nos campos
    const inputDescricao = screen.getByLabelText(/Descrição \/ Histórico/i)
    await user.type(inputDescricao, 'Teste de RTL')
    
    const inputValor = screen.getByLabelText(/Valor/i)
    await user.type(inputValor, '150,00')

    // Submete
    const btnConfirmar = screen.getByRole('button', { name: /Confirmar/i })
    await user.click(btnConfirmar)

    // O teste foca em garantir que os inputs aceitam a digitação sem quebrar
    expect(inputDescricao).toHaveValue('Teste de RTL')
    expect(inputValor).toHaveValue('150,00')
  })
})
