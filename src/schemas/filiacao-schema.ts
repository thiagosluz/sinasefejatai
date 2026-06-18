import { z } from 'zod'

export const FiliacaoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.').max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  telefone: z.string().optional(),
  siape: z.string().min(1, 'A matrícula SIAPE é obrigatória.'),
  unidade_lotacao: z.string().optional(),
  campus: z.string().optional(),
  categoria: z.enum(['Técnico Administrativo', 'Docente'], {
    message: 'Selecione uma categoria válida.'
  }),
  situacao: z.enum(['Ativo', 'Aposentado'], {
    message: 'Selecione uma situação válida.'
  }),
  data_nascimento: z.string().optional(),
  nome_pai: z.string().optional(),
  nome_mae: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  sexo: z.string().optional(),
  endereco_rua: z.string().optional(),
  endereco_bairro: z.string().optional(),
  endereco_cep: z.string().optional(),
  endereco_cidade: z.string().optional(),
  endereco_estado: z.string().optional(),
  website: z.string().optional(),
  timestamp: z.string().optional()
})

export type FiliacaoFormData = z.infer<typeof FiliacaoSchema>
