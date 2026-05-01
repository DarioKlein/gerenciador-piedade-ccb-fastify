import { FastifyInstance } from 'fastify'
import db from '../database'
import { CreateBairro, UpdateBairro } from '../types/bairro'

export default async function bairrosRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db
      .prepare(
        `
      SELECT b.*, s.nome as setor_nome, s.tipo as setor_tipo
      FROM bairros b
      INNER JOIN setores s ON s.id = b.setor_id
      ORDER BY b.nome
    `,
      )
      .all()
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const bairro = db
      .prepare(
        `
      SELECT b.*, s.nome as setor_nome, s.tipo as setor_tipo
      FROM bairros b
      INNER JOIN setores s ON s.id = b.setor_id
      WHERE b.id = ?
    `,
      )
      .get(id)

    if (!bairro) return reply.status(404).send({ message: 'Bairro não encontrado' })

    return bairro
  })

  app.get('/setor/:setor_id', async (request, reply) => {
    const { setor_id } = request.params as { setor_id: number }

    const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(setor_id)
    if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })

    return db
      .prepare(
        `
      SELECT * FROM bairros WHERE setor_id = ? ORDER BY nome
    `,
      )
      .all(setor_id)
  })

  app.post('/', async (request, reply) => {
    const body = request.body as CreateBairro

    const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(body.setor_id)
    if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })

    const result = db
      .prepare(
        `
      INSERT INTO bairros (nome, setor_id)
      VALUES (@nome, @setor_id)
    `,
      )
      .run(body)

    return reply.status(201).send({ id: result.lastInsertRowid })
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    const body = request.body as UpdateBairro

    const bairro = db.prepare('SELECT * FROM bairros WHERE id = ?').get(id)
    if (!bairro) return reply.status(404).send({ message: 'Bairro não encontrado' })

    if (body.setor_id) {
      const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(body.setor_id)
      if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })
    }

    db.prepare(
      `
      UPDATE bairros
      SET
        nome = COALESCE(@nome, nome),
        setor_id = COALESCE(@setor_id, setor_id)
      WHERE id = @id
    `,
    ).run({ nome: null, setor_id: null, ...body, id })

    return reply.send({ message: 'Bairro atualizado com sucesso' })
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const bairro = db.prepare('SELECT * FROM bairros WHERE id = ?').get(id)
    if (!bairro) return reply.status(404).send({ message: 'Bairro não encontrado' })

    db.prepare('DELETE FROM bairros WHERE id = ?').run(id)

    return reply.send({ message: 'Bairro removido com sucesso' })
  })
}
