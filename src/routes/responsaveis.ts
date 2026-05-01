import { FastifyInstance } from 'fastify'
import db from '../database'
import { CreateResponsavel, UpdateResponsavel } from '../types/responsavel'

export default async function responsaveisRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db.prepare('SELECT * FROM responsaveis ORDER BY nome').all()
  })

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const responsavel = db.prepare('SELECT * FROM responsaveis WHERE id = ?').get(id)

    if (!responsavel) return reply.status(404).send({ message: 'Responsável não encontrado' })

    return responsavel
  })

  app.post('/', async (request, reply) => {
    const body = request.body as CreateResponsavel

    try {
      const result = db
        .prepare(
          `
      INSERT INTO responsaveis (nome, tipo, contato)
      VALUES (@nome, @tipo, @contato)
    `,
        )
        .run(body)

      return reply.status(201).send({ id: result.lastInsertRowid })
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return reply.status(409).send({ message: 'Este contato já está cadastrado' })
      }
      throw err
    }
  })

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }
    const body = request.body as UpdateResponsavel

    const responsavel = db.prepare('SELECT * FROM responsaveis WHERE id = ?').get(id)
    if (!responsavel) return reply.status(404).send({ message: 'Responsável não encontrado' })

    try {
      db.prepare(
        `
      UPDATE responsaveis
      SET
        nome = COALESCE(@nome, nome),
        tipo = COALESCE(@tipo, tipo),
        contato = COALESCE(@contato, contato)
      WHERE id = @id
    `,
      ).run({
        nome: null,
        tipo: null,
        contato: null,
        ...body,
        id,
      })

      return reply.send({ message: 'Responsável atualizado com sucesso' })
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return reply.status(409).send({ message: 'Este contato já está cadastrado' })
      }
      throw err
    }
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: number }

    const responsavel = db.prepare('SELECT * FROM responsaveis WHERE id = ?').get(id)
    if (!responsavel) return reply.status(404).send({ message: 'Responsável não encontrado' })

    db.prepare('DELETE FROM responsaveis WHERE id = ?').run(id)

    return reply.send({ message: 'Responsável removido com sucesso' })
  })
}
