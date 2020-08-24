import React, { createContext, useState, useCallback, useEffect } from 'react'
import { useQuery } from '@apollo/client'

import { QUERY_USER } from '../apollo/queries'
import { User } from '../types'

interface Props {}

type Actions = 'signup' | 'signin' | 'request' | 'reset' | 'close'

type HandleAuthAction = (action: Actions) => void

interface AuthContextValues {
  authAction: Actions
  handleAuthAction: HandleAuthAction
  loggedInUser: User | null
}

const initialState: AuthContextValues = {
  authAction: 'close',
  handleAuthAction: () => {},
  loggedInUser: null,
}

export const AuthContext = createContext<AuthContextValues>(initialState)

const AuthContextProvider: React.FC<Props> = ({ children }) => {
  const [authAction, setAuthAction] = useState<Actions>('close')
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)

  const { data } = useQuery<{ user: User }>(QUERY_USER, {
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (data?.user) setLoggedInUser(data.user)
  }, [data])

  const handleAuthAction: HandleAuthAction = useCallback((action) => {
    setAuthAction(action)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authAction,
        handleAuthAction,
        loggedInUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
