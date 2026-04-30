import { Responsavel } from './responsavel'

export type SetorTipo = 'setor' | 'distrito'

export interface Setor {
  id: number
  nome: string
  tipo: SetorTipo
}

export interface SetorComResponsaveis extends Setor {
  responsaveis: Responsavel[]
}

export type CreateSetor = Omit<Setor, 'id'>
export type UpdateSetor = Partial<CreateSetor>
