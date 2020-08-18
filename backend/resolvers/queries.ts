import { RouterContext } from 'https://deno.land/x/oak/mod.ts'
import { client } from '../db/db.ts'
import { isAuthenticated } from '../utils/authUtils.ts'
import { UserResponse } from '../types/types.ts'

export const Query = {
  users: async () => {
    await client.connect()
    const result = await client.query('SELECT * FROM users;')
    const users = result.rowsOfObjects()
    await client.end()
    return users
  },
  user: async (_: any, __: any, ctx: RouterContext): Promise<UserResponse | null> => {
    try {
      const user = await isAuthenticated(ctx.request)
      
      const returnedUser: UserResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
      }

      return returnedUser
    } catch (error) {
      throw error
    }
  },
}
