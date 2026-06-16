import { z } from 'zod'

export const FiliacaoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  telefone: z.string().optional(),
  siape: z.string().regex(/^\d{7}$/, 'O SIAPE deve conter exatamente 7 dígitos.'),
  unidade_lotacao: z.string().optional(),
  campus: z.string().optional(),
  categoria: z.enum(['Técnico Administrativo', 'Docente'], {
    message: 'Selecione uma categoria válida.'
  }),
  situacao: z.enum(['Ativo', 'Aposentado'], {
    message: 'Selecione uma situação válida.'
  }),
  website: z.string().optional(),
  timestamp: z.string().optional()
})

export type FiliacaoFormData = z.infer<typeof FiliacaoSchema>
