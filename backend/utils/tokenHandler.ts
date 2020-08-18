import { Cookies } from 'https://deno.land/x/oak/mod.ts'
import { validateJwt } from 'https://deno.land/x/djwt@v1.2/validate.ts'
import {
  makeJwt,
  setExpiration,
  Jose,
  Payload,
} from 'https://deno.land/x/djwt@v1.2/create.ts'
import { config } from 'https://deno.land/x/dotenv@v0.5.0/mod.ts'
import { PayloadInfo } from '../types/types.ts'

const { JWT_SECRET, COOKIE_TOKEN_NAME } = config()

const header: Jose = {
  alg: 'HS256',
  typ: 'JWT',
}

export const createToken = (id: string, token_version: number) => {
  const payloadInfo: PayloadInfo = {
    id,
    token_version,
  }
  const payload: Payload = {
    payloadInfo,
    exp: setExpiration(Date.now() + 1000 * 60 * 60 * 24 * 15),
  }
  return makeJwt({ header, key: JWT_SECRET, payload })
}

export const sendToken = (cookies: Cookies, token: string) =>
  cookies.set(COOKIE_TOKEN_NAME, token, { httpOnly: true })

export const verifyToken = (token: string) =>
  validateJwt({ jwt: token, key: JWT_SECRET, algorithm: 'HS256' })
