export type Voto = { aFavor: string; contra: string; abstencoes: string; encaminhamento?: string }
export type PautaExtra = { titulo: string; solicitante: string; status: 'aprovada' | 'rejeitada'; motivoRecusa?: string }

export interface AtaEditorState {
  presidente: string
  redator: string
  conteudoRich: string
  votos: Record<number, Voto>
  pautasExtras: PautaExtra[]
  copiado: boolean
  salvando: boolean
  ataSalva: boolean
}

export type AtaEditorAction =
  | { type: 'SET_PRESIDENTE'; payload: string }
  | { type: 'SET_REDATOR'; payload: string }
  | { type: 'SET_CONTEUDO_RICH'; payload: string }
  | { type: 'SET_COPIADO'; payload: boolean }
  | { type: 'SET_SALVANDO'; payload: boolean }
  | { type: 'SET_ATA_SALVA'; payload: boolean }
  | { type: 'UPDATE_VOTO'; payload: { index: number; field: keyof Voto; value: string } }
  | { type: 'ADD_PAUTA_EXTRA' }
  | { type: 'UPDATE_PAUTA_EXTRA'; payload: { index: number; field: keyof PautaExtra; value: string } }
  | { type: 'REMOVE_PAUTA_EXTRA'; payload: { index: number } }
  | { type: 'INIT_STATE'; payload: AtaEditorState }

export function ataEditorReducer(state: AtaEditorState, action: AtaEditorAction): AtaEditorState {
  switch (action.type) {
    case 'SET_PRESIDENTE':
      return { ...state, presidente: action.payload }
    case 'SET_REDATOR':
      return { ...state, redator: action.payload }
    case 'SET_CONTEUDO_RICH':
      return { ...state, conteudoRich: action.payload }
    case 'SET_COPIADO':
      return { ...state, copiado: action.payload }
    case 'SET_SALVANDO':
      return { ...state, salvando: action.payload }
    case 'SET_ATA_SALVA':
      return { ...state, ataSalva: action.payload }
    case 'UPDATE_VOTO': {
      const { index, field, value } = action.payload
      const currentVoto = state.votos[index] || { aFavor: '', contra: '', abstencoes: '', encaminhamento: '' }
      return {
        ...state,
        votos: {
          ...state.votos,
          [index]: { ...currentVoto, [field]: value }
        }
      }
    }
    case 'ADD_PAUTA_EXTRA':
      return {
        ...state,
        pautasExtras: [...state.pautasExtras, { titulo: '', solicitante: '', status: 'aprovada' }]
      }
    case 'UPDATE_PAUTA_EXTRA': {
      const { index, field, value } = action.payload
      const newPautas = [...state.pautasExtras]
      newPautas[index] = { ...newPautas[index], [field]: value } as PautaExtra
      return { ...state, pautasExtras: newPautas }
    }
    case 'REMOVE_PAUTA_EXTRA': {
      const newPautas = [...state.pautasExtras]
      newPautas.splice(action.payload.index, 1)
      return { ...state, pautasExtras: newPautas }
    }
    case 'INIT_STATE':
      return action.payload
    default:
      return state
  }
}
