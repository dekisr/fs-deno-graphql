import { Client } from 'https://deno.land/x/postgres@v0.4.3/mod.ts'
import { config } from '../deps/dotenv.ts'

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = config()

export const client = new Client({
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  hostname: DB_HOST,
  port: Number(DB_PORT),
})
