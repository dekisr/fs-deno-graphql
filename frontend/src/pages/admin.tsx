import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'

import { AuthContext } from '../context/AuthContextProvider'

import Admin from '../components/Admin'
import { isAdmin } from '../helpers/authHelpers'

export default function AdminPage() {
  const { loggedInUser } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    loggedInUser && !isAdmin(loggedInUser) && router.push('/')
  }, [loggedInUser])

  return !loggedInUser ? (
    <p>Loading...</p>
  ) : isAdmin(loggedInUser) ? (
    <Admin />
  ) : null
}
