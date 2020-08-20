import { RouterContext } from '../deps/oak.ts'
import { client } from '../db/db.ts'
import {
  isAuthenticated,
  isSuperAdmin,
  checkAdmin,
} from '../utils/authUtils.ts'
import { UserResponse } from '../types/types.ts'
import { queryUsersString } from '../utils/queryStrings.ts'

export const Query = {
  users: async (
    _: any,
    __: any,
    ctx: RouterContext
  ): Promise<UserResponse[] | null> => {
    // Authentication check
    const admin = await isAuthenticated(ctx.request)

    // Authorization check (admin and super admin roles)
    const isSuper = isSuperAdmin(admin.roles)
    const isAdmin = checkAdmin(admin.roles)
    if (!isSuper && !isAdmin) throw new Error('Not authorized.')

    await client.connect()
    const result = await client.query(queryUsersString())
    const users = result.rowsOfObjects()
    await client.end()

    const returnedUsers: UserResponse[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      created_at: user.created_at,
    }))

    return returnedUsers
  },
  user: async (
    _: any,
    __: any,
    ctx: RouterContext
  ): Promise<UserResponse | null> => {
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
