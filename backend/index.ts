import { Application } from 'https://deno.land/x/oak/mod.ts'
import { GraphQLService } from './server.ts'
import { config } from 'https://deno.land/x/dotenv@v0.5.0/mod.ts'
import { checkToken } from './middlewares/index.ts'

const { PORT } = config()
const app = new Application()
// app.use((ctx) => {
//   ctx.response.body = 'Hello there from Oak.'
// })

app.use(checkToken)

app.use(GraphQLService.routes(), GraphQLService.allowedMethods())
console.log(`Server is ready at http://localhost:${PORT}/graphql`)
await app.listen({ port: Number(PORT) })
