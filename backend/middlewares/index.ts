import { Middleware } from '../deps/oak.ts'
import { JwtValidation } from '../deps/djwt.ts'
import { config } from '../deps/dotenv.ts'
import { verifyToken, createToken, sendToken } from '../utils/tokenHandler.ts'
import { ValidPayload, User } from '../types/types.ts'
import { isAuthenticated } from '../utils/authUtils.ts'
import { client } from '../db/db.ts'
import { updateTokenVersionString } from '../utils/queryStrings.ts'

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

      // Calculate how long the current token has been created
      const currentTokenAge = Date.now() + 1000 * 60 * 60 * 24 * 15 - exp * 1000

      // Check if the current token age is greater than 6 hours
      if (currentTokenAge > 1000 * 60 * 60 * 6) {
        try {
          const user = await isAuthenticated(ctx.request)
          if (user) {
            // Invalidate the current token --> updating the token version
            await client.connect()
            const updatedUserData = await client.query(
              updateTokenVersionString(user.id, user.token_version + 1)
            )
            const updatedUser = updatedUserData.rowsOfObjects()[0] as User
            if (updatedUser) {
              // Create the new token
              const newToken = await createToken(
                updatedUser.id,
                updatedUser.token_version
              )

              // Send the new token to the frontend
              sendToken(ctx.cookies, newToken)

              // Reattach the new token version into the request object
              ctx.request.tokenVersion = updatedUser.token_version
              ctx.request.exp = (Date.now() + 60 * 60 * 24 * 15 * 1000) / 1000
            }

            await client.end()
          }
        } catch (error) {}
      }
    }
  }
  await next()
}
