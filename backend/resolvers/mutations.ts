import { RouterContext } from 'https://deno.land/x/oak/mod.ts'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.2.4/mod.ts'

import { SignupArgs, UserResponse, User } from '../types/types.ts'
import {
  validateUsername,
  validatePassword,
  validateEmail,
} from '../utils/validations.ts'
import { client } from '../db/db.ts'
import { queryByEmailString, insertUserString } from '../utils/queryStrings.ts'
import { createToken, sendToken } from '../utils/tokenHandler.ts'

export const Mutation = {
  signup: async (
    _: any,
    { username, email, password }: SignupArgs,
    ctx: RouterContext
  ): Promise<UserResponse | null> => {
    try {
      // Check  if args obj is provided
      if (!username) throw new Error('Username is required.')
      if (!email) throw new Error('Email is required.')
      if (!password) throw new Error('Password is required.')

      // Validate username
      const formatedUsername = username.trim()
      const isUsernameValid = validateUsername(formatedUsername)
      if (!isUsernameValid)
        throw new Error('Username must be between 3 ~ 200 characters')
      // Validate Password
      const isPasswordValid = validatePassword(password)
      if (!isPasswordValid)
        throw new Error('Password must be between 6 ~ 30 characters')
      // Validate Email
      const formatedEmail = email.trim().toLowerCase()
      const isEmailValid = validateEmail(formatedEmail)
      if (!isEmailValid) throw new Error('Email is invalid.')

      // Connect to the database
      await client.connect()

      // Check user
      const result = await client.query(queryByEmailString(formatedEmail))
      const user = result.rowsOfObjects()[0] as User
      if (user) throw new Error('This email is already in use')

      // Hash the password
      const hashedPassword = await bcrypt.hash(password)
      // Save new user to the database
      const userData = await client.query(
        insertUserString(formatedUsername, formatedEmail, hashedPassword)
      )

      const newUser = userData.rowsOfObjects()[0] as User
      const returnedUser: UserResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
        created_at: newUser.created_at,
      }

      await client.end()

      // Create a JWT token
      const token = await createToken(newUser.id, newUser.token_version)
      // console.log('Token', token)

      // Send the JWT token to the frontend
      sendToken(ctx.cookies, token)

      return returnedUser
    } catch (error) {
      throw error
    }
  },
}
