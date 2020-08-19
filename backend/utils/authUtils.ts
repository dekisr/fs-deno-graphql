import { Request } from 'https://deno.land/x/oak/mod.ts'
import { client } from '../db/db.ts'
import { queryByIdString } from './queryStrings.ts'
import { User, RoleOptions } from '../types/types.ts'

export const isAuthenticated = async (request: Request) => {
  // Check the user id
  if (!request.userId) throw new Error('Please login to proceed.')

  // Query user from the database
  await client.connect()
  const result = await client.query(queryByIdString(request.userId))
  const user = result.rowsOfObjects()[0] as User
  if (!user) throw new Error('Not authenticated.')

  // Check if the token version is valid
  if (user.token_version !== request.tokenVersion)
    throw new Error('Not authenticated.')

  await client.end()
  return user
}

export const isSuperAdmin = (roles: RoleOptions[]) =>
  roles.includes(RoleOptions.superAdmin)

export const checkAdmin = (roles: RoleOptions[]) =>
  roles.includes(RoleOptions.admin)
