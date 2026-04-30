import { Bairro } from './bairro'

export type FamiliaSituacao = 'aposentado' | 'registrado' | 'autonomo' | 'desempregado' | 'encostado' | 'pensionista'

export type FamiliaResidencia = 'propria' | 'alugada' | 'cedida' | 'financiada'

export type FamiliaObs = 'congrega' | 'parado' | 'afastado'

export interface Familia {
  id: number
  nome: string
  endereco: string | null
  num_moradores: number | null
  num_criancas: number | null
  num_idosos: number | null
  num_enfermos: number | null
  num_batizados: number | null
  situacao: FamiliaSituacao | null
  residencia: FamiliaResidencia | null
  obs: FamiliaObs | null
  bairro_id: number
}

export interface FamiliaComBairro extends Familia {
  bairro: Bairro
}

export type CreateFamilia = Omit<Familia, 'id'>
export type UpdateFamilia = Partial<CreateFamilia>
