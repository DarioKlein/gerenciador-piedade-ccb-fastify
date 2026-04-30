import { Setor } from './setor'

export interface Bairro {
  id: number
  nome: string
  setor_id: number
}

export interface BairroComSetor extends Bairro {
  setor: Setor
}

export type CreateBairro = Omit<Bairro, 'id'>
export type UpdateBairro = Partial<CreateBairro>
