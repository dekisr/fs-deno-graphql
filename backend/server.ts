import { gql } from 'https://deno.land/x/oak_graphql/mod.ts'

// GraphQL Type
export const typeDefs = (gql as any)`
  type User {
    username: String!
    email: String!
    password: String!
  }

  type Query {
    users: [User]!
  }

  type Mutation {
    signup(
      username: String!,
      email: String!,
      password: String!
    ): User
  }
`

const users = [
  { username: 'Dummy', email: 'dummy@email.com', password: 'hello' },
]

// Resolvers
export const resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    signup: (
      parent: any,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string },
      ctx: any,
      info: any
    ) => {
      const newUser = { username, email, password }
      users.push(newUser)
      return newUser
    },
  },
}
