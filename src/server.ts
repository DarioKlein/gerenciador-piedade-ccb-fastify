import { env } from 'process'
import { app } from './app'

app
  .listen({
    host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
    port: env.PORT ? Number(env.PORT) : 3000,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
