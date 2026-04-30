export type ResponsavelTipo = 'diacono' | 'iop'

export interface Responsavel {
  id: number
  nome: string
  tipo: ResponsavelTipo
  contato: string | null
}

export type CreateResponsavel = Omit<Responsavel, 'id'>
export type UpdateResponsavel = Partial<CreateResponsavel>
