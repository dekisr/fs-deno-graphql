import { gql } from '@apollo/client'

export const SIGN_UP = gql`
  mutation SIGN_UP($username: String!, $email: String!, $password: String!) {
    signup(username: $username, email: $email, password: $password) {
      id
      username
      email
      roles
      created_at
    }
  }
`
export const SIGN_IN = gql`
  mutation SIGN_IN($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      username
      email
      roles
      created_at
    }
  }
`
export const SIGN_OUT = gql`
  mutation {
    signout {
      message
    }
  }
`
export const REQUEST_TO_RESET_PASSWORD = gql`
  mutation REQUEST_TO_RESET_PASSWORD($email: String!) {
    requestToResetPassword(email: $email) {
      message
    }
  }
`
export const RESET_PASSWORD = gql`
  mutation RESET_PASSWORD($password: String!, $token: String!) {
    resetPassword(password: $password, token: $token) {
      message
    }
  }
`
export const UPDATE_ROLES = gql`
  mutation UPDATE_ROLES($id: String!, $roles: [RoleOptions!]!) {
    updateRoles(id: $id, roles: $roles) {
      id
      username
      email
      roles
      created_at
    }
  }
`
export const DELETE_USER = gql`
  mutation DELETE_USER($id: String!) {
    deleteUser(id: $id) {
      message
    }
  }
`
export const SOCIAL_MEDIA_LOGIN = gql`
  mutation SOCIAL_MEDIA_LOGIN(
    $username: String!
    $email: String
    $id: String!
    $expiration: String!
    $provider: Provider!
  ) {
    socialMediaLogin(
      username: $username
      email: $email
      id: $id
      expiration: $expiration
      provider: $provider
    ) {
      id
      username
      email
      roles
      created_at
    }
  }
`
