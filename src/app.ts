import fastify from 'fastify'
import responsaveisRoutes from './routes/responsaveis'
import setoresRoutes from './routes/setores'
import bairrosRoutes from './routes/bairros'
import familiasRoutes from './routes/familias'

export const app = fastify({ logger: true })

app.register(responsaveisRoutes, { prefix: '/api/responsaveis' })
app.register(setoresRoutes, { prefix: '/api/setores' })
app.register(bairrosRoutes, { prefix: '/api/bairros' })
app.register(familiasRoutes, { prefix: '/api/familias' })