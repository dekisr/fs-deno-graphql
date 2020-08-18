import { Middleware } from 'https://deno.land/x/oak/mod.ts'
import { JwtValidation } from 'https://deno.land/x/djwt@v1.2/validate.ts'
import { config } from 'https://deno.land/x/dotenv@v0.5.0/mod.ts'
import { verifyToken } from '../utils/tokenHandler.ts'
import { ValidPayload } from '../types/types.ts'

const { COOKIE_TOKEN_NAME } = config()

export const checkToken: Middleware = async (ctx, next) => {
  const token = ctx.cookies.get(COOKIE_TOKEN_NAME)
  if (token) {
    // Decode the token
    const decodedToken: JwtValidation = await verifyToken(token)
    if (decodedToken.isValid) {
      const { payloadInfo, exp } = decodedToken.payload as ValidPayload
      ctx.request.userId = payloadInfo?.id
      ctx.request.tokenVersion = payloadInfo?.token_version
      ctx.request.exp = exp
    }
  }
  await next()
}
