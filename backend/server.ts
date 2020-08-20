import { Router, RouterContext } from './deps/oak.ts'
import { applyGraphQL } from './deps/oak_graphql.ts'
import { typeDefs } from './schema/typeDefs.ts'
import { resolvers } from './resolvers/index.ts'

export const GraphQLService = await applyGraphQL<Router>({
  Router,
  typeDefs,
  resolvers,
  context: (ctx: RouterContext) => ctx
})
