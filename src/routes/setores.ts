import { FastifyInstance } from 'fastify'
import db from '../database'
import { CreateSetor, UpdateSetor } from '../types/setor'

export default async function setoresRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const setores = db.prepare('SELECT * FROM setores ORDER BY nome').all()

    return setores.map((setor: any) => ({
      ...setor,
      responsaveis: db
        .prepare(
          `
        SELECT r.* FROM responsaveis r
        INNER JOIN setores_responsaveis sr ON sr.responsavel_id = r.id
        WHERE sr.setor_id = ?
      `,
        )
        .all(setor.id),
    }))
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(id)
    if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })

    const responsaveis = db
      .prepare(
        `
      SELECT r.* FROM responsaveis r
      INNER JOIN setores_responsaveis sr ON sr.responsavel_id = r.id
      WHERE sr.setor_id = ?
    `,
      )
      .all(id)

    return { ...setor, responsaveis }
  })

  app.post('/', async (request, reply) => {
    const body = request.body as CreateSetor

    const result = db
      .prepare(
        `
      INSERT INTO setores (nome, tipo)
      VALUES (@nome, @tipo)
    `,
      )
      .run(body)

    return reply.status(201).send({ id: result.lastInsertRowid })
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    const body = request.body as UpdateSetor

    const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(id)
    if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })

    db.prepare(
      `
      UPDATE setores
      SET
        nome = COALESCE(@nome, nome),
        tipo = COALESCE(@tipo, tipo)
      WHERE id = @id
    `,
    ).run({ nome: null, tipo: null, ...body, id })

    return reply.send({ message: 'Setor atualizado com sucesso' })
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(id)
    if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })

    db.prepare('DELETE FROM setores WHERE id = ?').run(id)

    return reply.send({ message: 'Setor removido com sucesso' })
  })

  app.post('/:id/responsaveis', async (request, reply) => {
    const { id } = request.params as { id: number }
    const { responsavel_id } = request.body as { responsavel_id: number }

    const setor = db.prepare('SELECT * FROM setores WHERE id = ?').get(id)
    if (!setor) return reply.status(404).send({ message: 'Setor não encontrado' })

    const responsavel = db.prepare('SELECT * FROM responsaveis WHERE id = ?').get(responsavel_id)
    if (!responsavel) return reply.status(404).send({ message: 'Responsável não encontrado' })

    try {
      db.prepare(
        `
        INSERT INTO setores_responsaveis (setor_id, responsavel_id)
        VALUES (?, ?)
      `,
      ).run(id, responsavel_id)

      return reply.status(201).send({ message: 'Responsável vinculado com sucesso' })
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return reply.status(409).send({ message: 'Responsável já vinculado a este setor' })
      }
      throw err
    }
  })

  app.delete('/:id/responsaveis/:responsavel_id', async (request, reply) => {
    const { id, responsavel_id } = request.params as { id: number; responsavel_id: number }

    const vinculo = db
      .prepare(
        `
      SELECT * FROM setores_responsaveis WHERE setor_id = ? AND responsavel_id = ?
    `,
      )
      .get(id, responsavel_id)

    if (!vinculo) return reply.status(404).send({ message: 'Vínculo não encontrado' })

    db.prepare(
      `
      DELETE FROM setores_responsaveis WHERE setor_id = ? AND responsavel_id = ?
    `,
    ).run(id, responsavel_id)

    return reply.send({ message: 'Responsável desvinculado com sucesso' })
  })
}
