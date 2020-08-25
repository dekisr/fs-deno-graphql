import { gql } from '@apollo/client'

export const QUERY_USER = gql`
  query {
    user {
      id
      username
      email
      roles
      created_at
    }
  }
`
export const QUERY_USERS = gql`
  query {
    users {
      id
      username
      email
      roles
      created_at
    }
  }
`
