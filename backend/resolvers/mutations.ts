import { v4 } from '../deps/uuid.ts'
import { RouterContext } from '../deps/oak.ts'
import bcrypt from '../deps/bcrypt.ts'

import {
  SignupArgs,
  UserResponse,
  User,
  SigninArgs,
  ResponseMessage,
  UpdateRolesArgs,
} from '../types/types.ts'

import {
  validateUsername,
  validatePassword,
  validateEmail,
} from '../utils/validations.ts'
import { client } from '../db/db.ts'
import { isAuthenticated, isSuperAdmin } from '../utils/authUtils.ts'
import {
  queryByEmailString,
  insertUserString,
  updateTokenVersionString,
  updateRequestResetPasswordString,
  queryByResetPasswordTokenString,
  updateResetPasswordString,
  queryByIdString,
  updateRolesString,
  deleteUserByIdString,
} from '../utils/queryStrings.ts'
import { createToken, sendToken, deleteToken } from '../utils/tokenHandler.ts'
import { sendEmail } from '../utils/emailHandler.ts'

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
  signin: async (
    _: any,
    { email, password }: SigninArgs,
    ctx: RouterContext
  ): Promise<UserResponse | null> => {
    try {
      // Check  if args obj is provided
      if (!email) throw new Error('Email is required.')
      if (!password) throw new Error('Password is required.')

      // Validate Email
      const formatedEmail = email.trim().toLowerCase()

      // Connect to the database
      await client.connect()

      // Check user
      const result = await client.query(queryByEmailString(formatedEmail))
      const user = result.rowsOfObjects()[0] as User
      if (!user) throw new Error('Email or password is invalid')

      // Check if the reset_password_token is not null
      if (user.reset_password_token)
        throw new Error('Please reset your password.')

      // Validate the password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) throw new Error('Email or password is invalid')

      const returnedUser: UserResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        created_at: user.created_at,
      }

      await client.end()

      // Create a JWT token
      const token = await createToken(user.id, user.token_version)
      // console.log('Token', token)

      // Send the JWT token to the frontend
      sendToken(ctx.cookies, token)

      return returnedUser
    } catch (error) {
      throw error
    }
  },
  signout: async (
    _: any,
    __: any,
    ctx: RouterContext
  ): Promise<ResponseMessage | null> => {
    try {
      // Query user from the database
      const user = await isAuthenticated(ctx.request)
      // Update the token_version by incrasing by 1
      user.token_version++
      await client.connect()
      const updatedUserData = await client.query(
        updateTokenVersionString(user.id, user.token_version)
      )
      const updatedUser = updatedUserData.rowsOfObjects()[0] as User
      if (!updatedUser) throw new Error('Sorry, cannot proceed.')
      await client.end()
      // Delete the JWT token on cookies in the browser
      deleteToken(ctx.cookies)

      return { message: 'Goodbye' }
    } catch (error) {
      throw error
    }
  },
  requestToResetPassword: async (
    _: any,
    { email }: { email: string }
  ): Promise<ResponseMessage | null> => {
    try {
      if (!email) throw new Error('Email is required.')

      // Query user from the database
      await client.connect()
      const formatedEmail = email.trim().toLowerCase()
      const result = await client.query(queryByEmailString(formatedEmail))
      const user = result.rowsOfObjects()[0] as User
      if (!user) throw new Error('Email not found.')

      // Create reset password token, expiry time
      const uuid = v4.generate()
      const reset_password_token = await bcrypt.hash(uuid)
      const reset_password_token_expiry = Date.now() + 1000 * 60 * 30

      // Update user in the database
      const updatedUserData = await client.query(
        updateRequestResetPasswordString(
          formatedEmail,
          reset_password_token,
          reset_password_token_expiry
        )
      )
      const updatedUser = updatedUserData.rowsOfObjects()[0] as User
      if (!updatedUser) throw new Error('Sorry, cannot proceed.')
      await client.end()

      // Send a link to user's email
      const fromEmail = 'super_admin@test.com'
      const subject = 'Reset Your Password'
      const html = `
          <div style={{width: "60%"}}>
            <p>Please click the link below to reset your password.</p> \n\n
            <a href="http://localhost:3000/?resetToken=${reset_password_token}" target="_blank" rel="noreferrer noopener" style={{color: "blue"}}>Click to reset your password.</a>
          </div>
      `
      const response = await sendEmail(fromEmail, formatedEmail, subject, html)
      if (!response.ok) {
        console.log('error -->', response.error)
        throw new Error('Sorry, cannot proceed.')
      }

      return {
        message: 'Please check your email to reset your password.',
      }
    } catch (error) {
      throw error
    }
  },
  resetPassword: async (
    _: any,
    { password, token }: { password: string; token: string }
  ): Promise<ResponseMessage | null> => {
    try {
      if (!password || !token) throw new Error('Sorry, cannot proceed.')

      await client.connect()
      // Query user from the database by reset password token
      const result = await client.query(queryByResetPasswordTokenString(token))
      const user = result.rowsOfObjects()[0] as User
      if (!user) throw new Error('Sorry, cannot proceed.')

      // Check if the token is expired
      if (!user.reset_password_token_expiry)
        throw new Error('Sorry, cannot proceed.')
      const isTokenExpired = user.reset_password_token_expiry < Date.now()
      if (isTokenExpired) throw new Error('Sorry, cannot proceed.')

      // Hash the password
      const hashedPassword = await bcrypt.hash(password)
      // Update the user info in the database
      const updatedUserData = await client.query(
        updateResetPasswordString(user.id, hashedPassword)
      )
      const updatedUser = updatedUserData.rowsOfObjects()[0] as User
      if (!updatedUser) throw new Error('Sorry, cannot proceed.')
      await client.end()
      return {
        message:
          'Successfully reset your password, you can now signin with your new password.',
      }
    } catch (error) {
      throw error
    }
  },
  updateRoles: async (
    _: any,
    { id, roles }: UpdateRolesArgs,
    ctx: RouterContext
  ): Promise<UserResponse | null> => {
    try {
      // Check authentication of the user who call this mutation
      const admin = await isAuthenticated(ctx.request)

      // Check if the user who is logged is a super admin (Authorization)
      const isSuper = isSuperAdmin(admin.roles)
      if (!isSuper) throw new Error('Not authorized.')

      // Prevent the super admin to update their own
      if (ctx.request.userId === id) throw new Error('Sorry, cannot proceed.')

      // Query the user (to be updated) info from the database
      await client.connect()
      const result = await client.query(queryByIdString(id))
      const user = result.rowsOfObjects()[0] as User
      if (!user) throw new Error('Sorry, cannot proceed.')

      // Update user info in the database
      const updatedUserData = await client.query(updateRolesString(id, roles))
      const updatedUser = updatedUserData.rowsOfObjects()[0] as User
      if (!updatedUser) throw new Error('Sorry, cannot proceed.')

      await client.end()
      const returnedUser: UserResponse = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roles: updatedUser.roles,
        created_at: updatedUser.created_at,
      }
      return returnedUser
    } catch (error) {
      throw error
    }
  },
  deleteUser: async (
    _: any,
    { id }: { id: string },
    ctx: RouterContext
  ): Promise<ResponseMessage | null> => {
    try {
      // Check authentication of the user who call this mutation
      const admin = await isAuthenticated(ctx.request)

      // Check if the user who is logged is a super admin (Authorization)
      const isSuper = isSuperAdmin(admin.roles)
      if (!isSuper) throw new Error('Not authorized.')

      // Prevent the super admin to delete themselves
      if (ctx.request.userId === id) throw new Error('Sorry, cannot proceed.')

      // Query the user (to be updated) info from the database
      await client.connect()
      const result = await client.query(queryByIdString(id))
      const user = result.rowsOfObjects()[0] as User
      if (!user) throw new Error('Sorry, cannot proceed.')

      // Delete user from the database
      const deletedUserData = await client.query(deleteUserByIdString(id))
      if (!deletedUserData?.query?.result?.rowCount)
        throw new Error('Sorry, cannot proceed.')

      await client.end()
      return { message: `The user ID: ${id}, has been deleted.` }
    } catch (error) {
      throw error
    }
  },
}
