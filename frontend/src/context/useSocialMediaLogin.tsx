import { useContext, useState, useEffect } from 'react'
import { useMutation, ApolloError } from '@apollo/client'
import { useRouter } from 'next/router'

import { SOCIAL_MEDIA_LOGIN } from '../apollo/mutations'
import { User, SocialMediaLoginArgs, Provider } from '../types'
import { AuthContext } from '../context/AuthContextProvider'

export const useSocialMediaLogin = () => {
  const router = useRouter()
  const { setAuthUser, handleAuthAction } = useContext(AuthContext)
  const [loadingResult, setLoadingResult] = useState(false)
  const [errorResult, setErrorResult] = useState<ApolloError | undefined>(
    undefined
  )

  const [socialMediaLogin, { loading, error }] = useMutation<
    { socialMediaLogin: User },
    SocialMediaLoginArgs
  >(SOCIAL_MEDIA_LOGIN)

  useEffect(() => {
    setLoadingResult(loading)
  }, [loading])

  useEffect(() => {
    if (error) setErrorResult(error)
  }, [error])

  const facebookLogin = async (response: {
    name: string
    id: string
    email: string
    expiresIn: number
  }) => {
    try {
      const { id, name, email, expiresIn } = response
      const expiration = Date.now() + expiresIn * 1000
      const res = await socialMediaLogin({
        variables: {
          username: name,
          email,
          id,
          expiration: expiration.toString(),
          provider: Provider.facebook,
        },
      })
      if (res?.data) {
        const { socialMediaLogin } = res.data
        setAuthUser(socialMediaLogin)
        handleAuthAction('close')
        router.push('/dashboard')
      }
    } catch (error) {
      setAuthUser(null)
    }
  }

  const googleLogin = async (response: {
    profileObj: { googleId: string; name: string; email: string }
    tokenObj: { expires_in: number }
  }) => {
    try {
      const {
        profileObj: { googleId, name, email },
        tokenObj: { expires_in },
      } = response
      const expiration = Date.now() + expires_in * 1000
      const res = await socialMediaLogin({
        variables: {
          username: name,
          email,
          id: googleId,
          expiration: expiration.toString(),
          provider: Provider.google,
        },
      })
      if (res?.data) {
        const { socialMediaLogin } = res.data
        setAuthUser(socialMediaLogin)
        handleAuthAction('close')
        router.push('/dashboard')
      }
    } catch (error) {
      setAuthUser(null)
    }
  }

  return {
    facebookLogin,
    googleLogin,
    loadingResult,
    errorResult,
  }
}
