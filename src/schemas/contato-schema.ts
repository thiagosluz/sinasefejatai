import { z } from 'zod'

export const ContatoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  assunto: z.string().max(100, 'O assunto deve ter no máximo 100 caracteres.').optional(),
  mensagem: z.string()
    .min(10, 'A mensagem deve ter no mínimo 10 caracteres.')
    .max(2000, 'A mensagem não pode exceder 2000 caracteres.'),
  website: z.string().optional(),
  timestamp: z.string().optional()
})

export type ContatoFormData = z.infer<typeof ContatoSchema>
