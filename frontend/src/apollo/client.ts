import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import fetch from 'isomorphic-unfetch'

const link = new HttpLink({
  uri: process.env.NEXT_PUBLIC_BACKEND_URI,
  credentials: 'include',
  fetch,
})

export const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          roles: {
            merge(_ignore, incoming) {
              return incoming
            },
          },
        },
      },
      Query: {
        fields: {
          users: {
            merge(_ignore, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  link,
})
