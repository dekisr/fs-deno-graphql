import { Application, Router } from 'https://deno.land/x/oak/mod.ts'
import { applyGraphQL } from 'https://deno.land/x/oak_graphql/mod.ts'
import { typeDefs, resolvers } from './server.ts'

const app = new Application()

// app.use((ctx) => {
//   ctx.response.body = 'Hello there from Oak.'
// })

const GraphQLService = await applyGraphQL<Router>({
  Router,
  typeDefs,
  resolvers,
})

app.use(GraphQLService.routes(), GraphQLService.allowedMethods())

console.log(`Server is ready at http://localhost:8000/graphql`)
await app.listen({ port: 8000 })
