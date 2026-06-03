export function numeroPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais'

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const dez_a_dezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  function converterGrupo(n: number): string {
    if (n === 0) return ''
    if (n === 100) return 'cem'
    
    let extenso = ''
    
    const c = Math.floor(n / 100)
    const d = Math.floor((n % 100) / 10)
    const u = n % 10

    if (c > 0) extenso += centenas[c]

    if (d === 1) {
      extenso += (extenso ? ' e ' : '') + dez_a_dezenove[u]
      return extenso
    }

    if (d > 1) {
      extenso += (extenso ? ' e ' : '') + dezenas[d]
    }

    if (u > 0) {
      extenso += (extenso ? ' e ' : '') + unidades[u]
    }

    return extenso
  }

  const reais = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)

  let extensoReais = ''
  
  if (reais > 0) {
    const milhoes = Math.floor(reais / 1000000)
    const milhares = Math.floor((reais % 1000000) / 1000)
    const resto = reais % 1000

    if (milhoes > 0) {
      extensoReais += converterGrupo(milhoes) + (milhoes === 1 ? ' milhão' : ' milhões')
    }

    if (milhares > 0) {
      extensoReais += (extensoReais && milhares < 100 ? ' e ' : (extensoReais ? ', ' : '')) + converterGrupo(milhares) + ' mil'
    }

    if (resto > 0) {
      extensoReais += (extensoReais && resto < 100 ? ' e ' : (extensoReais ? ' e ' : '')) + converterGrupo(resto)
    }

    extensoReais += reais === 1 ? ' real' : ' reais'
  }

  let extensoCentavos = ''
  if (centavos > 0) {
    extensoCentavos = converterGrupo(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }

  if (reais > 0 && centavos > 0) {
    return extensoReais + ' e ' + extensoCentavos
  }

  if (reais > 0) return extensoReais
  return extensoCentavos
}
