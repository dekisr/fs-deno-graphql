import React, { useContext, useEffect } from 'react'
// import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import cookie from 'cookie'

import { AuthContext } from '../context/AuthContextProvider'

import Admin from '../components/Admin'
import { isAdmin } from '../helpers/authHelpers'
import { User } from '../types'

export default function AdminPage({ user }: { user: User }) {
  // const { loggedInUser } = useContext(AuthContext)
  const { setAuthUser } = useContext(AuthContext)
  // const router = useRouter()

  // useEffect(() => {
  //   if (!loggedInUser) router.push('/')
  // }, [loggedInUser])

  useEffect(() => {
    // if (!user) {
    //   router.push('/')
    // } else {
    //   if (!isAdmin(user)) {
    //     alert('Not authorized.')
    //     router.push('/dashboard')
    //   }
    // }
    setAuthUser(user)
  }, [user])

  return !user ? <p>Loading...</p> : <Admin />
}

const USER_INFO = {
  query: `
    query {
      user {
        id
        username
        email
        roles
        created_at
      }
    }
  `,
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies[process.env.NEXT_PUBLIC_TOKEN_NAME!]

    // No token --> not authenticated
    if (!token) {
      res.writeHead(302, { Location: '/' })
      res.end()
    }

    // Fetch the user info from the server
    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URI!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(USER_INFO),
    })

    if (!response.ok)
      return {
        props: {
          user: null,
        },
      }

    const data: { data: { user: User } } = await response.json()

    // No user info returned --> not authenticated
    if (!data?.data?.user) {
      res.writeHead(302, { Location: '/' })
      res.end()
    }

    // If the user is an admin user
    if (!isAdmin(data.data.user)) {
      res.writeHead(302, { Location: '/' })
      res.end()
    }

    return {
      props: {
        user: data.data.user,
      },
    }
  } catch (error) {
    return {
      props: {
        user: null,
      },
    }
  }
}
