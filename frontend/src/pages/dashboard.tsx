import React, { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'

import { AuthContext } from '../context/AuthContextProvider'

export default function Dashboard() {
  const { loggedInUser } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (!loggedInUser) router.push('/')
  }, [loggedInUser])

  return !loggedInUser ? <p>Loading...</p> : <h2>{loggedInUser.username}'s Dashboard</h2>
}
