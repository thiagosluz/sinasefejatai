export function formatarDataExtenso(dataStr?: string): string {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

  if (dataStr) {
    const [ano, mes, dia] = dataStr.split('-')
    return `Jataí-GO, ${dia} de ${meses[parseInt(mes) - 1]} de ${ano}`
  }

  const hoje = new Date()
  return `Jataí-GO, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`
}
