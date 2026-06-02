import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render } from '@/tests/test-utils'

import { Assembleia } from '../../types'
import { AssembleiaCard } from '../assembleia-card'

const mockAssembleia: Assembleia = {
  id: '123',
  tipo: 'Ordinária',
  data_realizacao: '2026-10-15',
  horario_1a_convocacao: '19:00',
  horario_2a_convocacao: '19:30',
  local: 'Sede Jataí',
  status: 'Agendada',
  pautas: ['Prestação de contas', 'Eleição'],
  numero: '001/2026',
  versao_edital: 1
}

describe('AssembleiaCard (Integração UI)', () => {
  it('deve renderizar a assembleia agendada com botões corretos', () => {
    const onAlterarStatus = vi.fn()
    const onDeletarSeguro = vi.fn()

    render(
      <AssembleiaCard 
        assembleia={mockAssembleia} 
        onAlterarStatus={onAlterarStatus} 
        onDeletarSeguro={onDeletarSeguro} 
      />
    )

    // Verifica se os textos vitais aparecem
    expect(screen.getByText(/Assembleia Geral Ordinária/i)).toBeInTheDocument()
    expect(screen.getByText('Prestação de contas')).toBeInTheDocument()
    
    // Para Agendada, deve aparecer o link de "Retificar"
    expect(screen.getByText(/Retificar/i)).toBeInTheDocument()
    
    // E também os botões de ação Concluir / Cancelar
    expect(screen.getByRole('button', { name: /Concluir/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
    
    // Não deve aparecer Excluir Permanentemente
    expect(screen.queryByRole('button', { name: /Excluir Permanentemente/i })).not.toBeInTheDocument()
  })

  it('deve chamar a prop onAlterarStatus ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    const onAlterarStatus = vi.fn()
    const onDeletarSeguro = vi.fn()

    render(
      <AssembleiaCard 
        assembleia={mockAssembleia} 
        onAlterarStatus={onAlterarStatus} 
        onDeletarSeguro={onDeletarSeguro} 
      />
    )

    const btnCancelar = screen.getByRole('button', { name: /Cancelar/i })
    await user.click(btnCancelar)

    // Verifica se a função foi acionada com os parâmetros corretos
    expect(onAlterarStatus).toHaveBeenCalledTimes(1)
    expect(onAlterarStatus).toHaveBeenCalledWith('123', 'Cancelada')
  })

  it('deve exibir tarja e botão de Excluir Permanentemente quando Cancelada', () => {
    const onAlterarStatus = vi.fn()
    const onDeletarSeguro = vi.fn()

    const assembleiaCancelada: Assembleia = {
      ...mockAssembleia,
      status: 'Cancelada'
    }

    render(
      <AssembleiaCard 
        assembleia={assembleiaCancelada} 
        onAlterarStatus={onAlterarStatus} 
        onDeletarSeguro={onDeletarSeguro} 
      />
    )

    // A tarja deve aparecer
    expect(screen.getByText('ASSEMBLEIA CANCELADA')).toBeInTheDocument()

    // O botão de exclusão perigosa deve aparecer
    const btnExcluir = screen.getByRole('button', { name: /Excluir Permanentemente/i })
    expect(btnExcluir).toBeInTheDocument()
    
    // Concluir e Cancelar (de novo) não podem aparecer
    expect(screen.queryByRole('button', { name: /Concluir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument()
  })
})
