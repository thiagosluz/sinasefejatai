import { describe, it, expect } from 'vitest'
import { parseOFX } from '../ofx-parser'

describe('parseOFX', () => {
  it('deve analisar corretamente um bloco OFX padrão com tags fechadas e gerar chaves compostas', () => {
    const ofx = `
      <OFX>
        <BANKMSGSRSV1>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20260512120000</DTPOSTED>
            <TRNAMT>-45.50</TRNAMT>
            <FITID>123456</FITID>
            <MEMO>TARIFA BANCARIA</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>CREDIT</TRNTYPE>
            <DTPOSTED>20260513120000</DTPOSTED>
            <TRNAMT>150.00</TRNAMT>
            <FITID>123457</FITID>
            <MEMO>PIX RECEBIDO</MEMO>
          </STMTTRN>
        </BANKMSGSRSV1>
      </OFX>
    `

    const result = parseOFX(ofx)
    expect(result).toHaveLength(2)

    expect(result[0]).toEqual({
      id: '123456_2026-05-12_45.50_Saída_0',
      tipo: 'Saída',
      data: '2026-05-12',
      descricao: 'TARIFA BANCARIA',
      valor: 45.50
    })

    expect(result[1]).toEqual({
      id: '123457_2026-05-13_150.00_Entrada_0',
      tipo: 'Entrada',
      data: '2026-05-13',
      descricao: 'PIX RECEBIDO',
      valor: 150.00
    })
  })

  it('deve analisar corretamente o formato do Banco do Brasil com tags abertas e chaves compostas', () => {
    const ofxBB = `
      <OFX>
        <STMTTRN>
          <TRNTYPE>DEBIT
          <DTPOSTED>20260520120000
          <TRNAMT>-120,50
          <FITID>bb-998877
          <MEMO>PIX ENVIADO SINDICATO
        </STMTTRN>
      </OFX>
    `

    const result = parseOFX(ofxBB)
    expect(result).toHaveLength(1)

    expect(result[0]).toEqual({
      id: 'bb-998877_2026-05-20_120.50_Saída_0',
      tipo: 'Saída',
      data: '2026-05-20',
      descricao: 'PIX ENVIADO SINDICATO',
      valor: 120.50
    })
  })

  it('deve extrair <NAME> quando a tag <MEMO> não estiver presente', () => {
    const ofx = `
      <STMTTRN>
        <TRNTYPE>CREDIT</TRNTYPE>
        <DTPOSTED>20260525120000</DTPOSTED>
        <TRNAMT>500.00</TRNAMT>
        <FITID>fit-name-only</FITID>
        <NAME>CONTRIBUICAO SINDICAL</NAME>
      </STMTTRN>
    `

    const result = parseOFX(ofx)
    expect(result).toHaveLength(1)
    expect(result[0].descricao).toBe('CONTRIBUICAO SINDICAL')
    expect(result[0].id).toBe('fit-name-only_2026-05-25_500.00_Entrada_0')
  })

  it('deve gerar IDs compostos determinísticos e incrementais para transações idênticas no mesmo dia', () => {
    const ofx = `
      <OFX>
        <STMTTRN>
          <TRNTYPE>DEBIT</TRNTYPE>
          <DTPOSTED>20260526120000</DTPOSTED>
          <TRNAMT>-10.00</TRNAMT>
          <FITID>9.903</FITID>
          <MEMO>TARIFA 1</MEMO>
        </STMTTRN>
        <STMTTRN>
          <TRNTYPE>DEBIT</TRNTYPE>
          <DTPOSTED>20260526120000</DTPOSTED>
          <TRNAMT>-10.00</TRNAMT>
          <FITID>9.903</FITID>
          <MEMO>TARIFA 2</MEMO>
        </STMTTRN>
      </OFX>
    `

    const result = parseOFX(ofx)
    expect(result).toHaveLength(2)

    expect(result[0].id).toBe('9.903_2026-05-26_10.00_Saída_0')
    expect(result[1].id).toBe('9.903_2026-05-26_10.00_Saída_1')
  })

  it('deve retornar array vazio se o formato for inválido ou não contiver transações', () => {
    const invalidOfx = `
      <OFX>
        <INVALID>conteudo qualquer</INVALID>
      </OFX>
    `
    const result = parseOFX(invalidOfx)
    expect(result).toEqual([])
  })
})
