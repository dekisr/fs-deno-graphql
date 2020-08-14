import { client } from '../db/db.ts'

export const Query = {
  users: async () => {
    await client.connect()
    const result = await client.query('SELECT * FROM users;')
    const users = result.rowsOfObjects()
    return users
  },
}
