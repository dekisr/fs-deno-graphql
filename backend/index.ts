import { Application } from './deps/oak.ts'
import { config } from './deps/dotenv.ts'
import { oakCors } from './deps/cors.ts'

import { GraphQLService } from './server.ts'
import { checkToken } from './middlewares/index.ts'

const { PORT, FRONTEND_URI } = config()
const app = new Application()
// app.use((ctx) => {
//   ctx.response.body = 'Hello there from Oak.'
// })

app.use(oakCors({ credentials: true, origin: FRONTEND_URI }))
app.use(checkToken)

app.use(GraphQLService.routes(), GraphQLService.allowedMethods())
console.log(`Server is ready at http://localhost:${PORT}/graphql`)
await app.listen({ port: Number(PORT) })
