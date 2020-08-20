import { Cookies } from '../deps/oak.ts'
import {
  validateJwt,
  makeJwt,
  setExpiration,
  Jose,
  Payload,
} from '../deps/djwt.ts'
import { config } from '../deps/dotenv.ts'
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
    exp: setExpiration(60 * 60 * 24 * 15),
  }
  return makeJwt({ header, key: JWT_SECRET, payload })
}

export const sendToken = (cookies: Cookies, token: string) =>
  cookies.set(COOKIE_TOKEN_NAME, token, { httpOnly: true })

export const verifyToken = (token: string) =>
  validateJwt({ jwt: token, key: JWT_SECRET, algorithm: 'HS256' })

export const deleteToken = (cookies: Cookies) =>
  cookies.delete(COOKIE_TOKEN_NAME)
