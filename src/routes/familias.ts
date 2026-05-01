import { FastifyInstance } from 'fastify'
import db from '../database'
import { CreateFamilia, UpdateFamilia } from '../types/familia'

export default async function familiasRoutes(app: FastifyInstance) {
  app.get('/', async request => {
    const { bairro_id, situacao, residencia, obs, search } = request.query as {
      bairro_id?: number
      situacao?: string
      residencia?: string
      obs?: string
      search?: string
    }

    let query = `
      SELECT f.*, b.nome as bairro_nome, s.nome as setor_nome
      FROM familias f
      INNER JOIN bairros b ON b.id = f.bairro_id
      INNER JOIN setores s ON s.id = b.setor_id
      WHERE 1=1
    `
    const params: any[] = []

    if (bairro_id) {
      query += ' AND f.bairro_id = ?'
      params.push(bairro_id)
    }

    if (situacao) {
      query += ' AND f.situacao = ?'
      params.push(situacao)
    }

    if (residencia) {
      query += ' AND f.residencia = ?'
      params.push(residencia)
    }

    if (obs) {
      query += ' AND f.obs = ?'
      params.push(obs)
    }

    if (search) {
      query += ' AND (f.nome LIKE ? OR f.endereco LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY f.nome'

    return db.prepare(query).all(...params)
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const familia = db
      .prepare(
        `
      SELECT f.*, b.nome as bairro_nome, s.nome as setor_nome
      FROM familias f
      INNER JOIN bairros b ON b.id = f.bairro_id
      INNER JOIN setores s ON s.id = b.setor_id
      WHERE f.id = ?
    `,
      )
      .get(id)

    if (!familia) return reply.status(404).send({ message: 'Família não encontrada' })

    return familia
  })

  app.post('/', async (request, reply) => {
    const body = request.body as CreateFamilia

    const bairro = db.prepare('SELECT * FROM bairros WHERE id = ?').get(body.bairro_id)
    if (!bairro) return reply.status(404).send({ message: 'Bairro não encontrado' })

    const result = db
      .prepare(
        `
      INSERT INTO familias (
        nome, endereco, num_moradores, num_criancas, num_idosos,
        num_enfermos, num_batizados, situacao, residencia, obs, bairro_id
      ) VALUES (
        @nome, @endereco, @num_moradores, @num_criancas, @num_idosos,
        @num_enfermos, @num_batizados, @situacao, @residencia, @obs, @bairro_id
      )
    `,
      )
      .run(body)

    return reply.status(201).send({ id: result.lastInsertRowid })
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    const body = request.body as UpdateFamilia

    const familia = db.prepare('SELECT * FROM familias WHERE id = ?').get(id)
    if (!familia) return reply.status(404).send({ message: 'Família não encontrada' })

    if (body.bairro_id) {
      const bairro = db.prepare('SELECT * FROM bairros WHERE id = ?').get(body.bairro_id)
      if (!bairro) return reply.status(404).send({ message: 'Bairro não encontrado' })
    }

    db.prepare(
      `
      UPDATE familias
      SET
        nome = COALESCE(@nome, nome),
        endereco = COALESCE(@endereco, endereco),
        num_moradores = COALESCE(@num_moradores, num_moradores),
        num_criancas = COALESCE(@num_criancas, num_criancas),
        num_idosos = COALESCE(@num_idosos, num_idosos),
        num_enfermos = COALESCE(@num_enfermos, num_enfermos),
        num_batizados = COALESCE(@num_batizados, num_batizados),
        situacao = COALESCE(@situacao, situacao),
        residencia = COALESCE(@residencia, residencia),
        obs = COALESCE(@obs, obs),
        bairro_id = COALESCE(@bairro_id, bairro_id)
      WHERE id = @id
    `,
    ).run({
      nome: null,
      endereco: null,
      num_moradores: null,
      num_criancas: null,
      num_idosos: null,
      num_enfermos: null,
      num_batizados: null,
      situacao: null,
      residencia: null,
      obs: null,
      bairro_id: null,
      ...body,
      id,
    })

    return reply.send({ message: 'Família atualizada com sucesso' })
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const familia = db.prepare('SELECT * FROM familias WHERE id = ?').get(id)
    if (!familia) return reply.status(404).send({ message: 'Família não encontrada' })

    db.prepare('DELETE FROM familias WHERE id = ?').run(id)

    return reply.send({ message: 'Família removida com sucesso' })
  })
}
