/**
 * Utilitários para formatação e manipulação de datas no projeto.
 * Garante tratamento correto do Fuso Horário (UTC-3 / Local)
 * para datas armazenadas como strings puros de YYYY-MM-DD.
 */

export function formatarDataPtBR(dataISO: string, options?: Intl.DateTimeFormatOptions) {
  // Se receber uma data vazia, retorna vazio
  if (!dataISO) return ''
  
  // Usamos o fuso horário UTC para evitar que datas como "2026-06-03" 
  // (meia-noite UTC) voltem 3 horas no Brasil e virem "2026-06-02".
  return new Date(dataISO).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    ...options
  })
}

/**
 * Formata uma data por extenso no estilo: "terça-feira, 2 de junho de 2026"
 */
export function formatarDataExtenso(dataISO: string) {
  return formatarDataPtBR(dataISO, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formata a data no formato: "3 de junho de 2026 (quarta-feira)"
 */
export function formatarDataComDiaParenteses(dataISO: string) {
  const data = formatarDataPtBR(dataISO, { day: 'numeric', month: 'long', year: 'numeric' })
  const diaSemana = new Date(dataISO).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long' })
  return `${data} (${diaSemana})`
}

/**
 * Formata a hora no padrão ABNT/INMETRO (Ex: 09h ou 09h30).
 * Se os minutos forem '00', exibe apenas a hora seguida de 'h' minúsculo, sem espaços.
 * Recebe hora em formato 'HH:mm:ss' ou 'HH:mm'.
 */
export function formatarHora(horaISO: string) {
  if (!horaISO) return ''
  
  // Pega apenas 'HH:mm'
  const partes = horaISO.slice(0, 5).split(':')
  if (partes.length !== 2) return horaISO // Fallback caso o formato venha quebrado
  
  const [hora, minuto] = partes
  
  if (minuto === '00') {
    return `${hora}h`
  }
  
  return `${hora}h${minuto}`
}
