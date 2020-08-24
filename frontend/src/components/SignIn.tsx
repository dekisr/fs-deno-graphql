import React, { useContext } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/router'
import { useForm, ErrorMessage } from 'react-hook-form'
import Loader from 'react-loader-spinner'

import Modal from './modal/Modal'
import { AuthContext } from '../context/AuthContextProvider'
import {
  FormContainer,
  Header,
  StyledForm,
  InputContainer,
  Input,
  Button,
  StyledSwitchAction,
  Divider,
  StyledError,
} from './SignUp'
import { SIGN_IN } from '../apollo/mutations'
import { SigninArgs, User } from '../types'
import { isAdmin } from '../helpers/authHelpers'

interface Props {}

const SignIn: React.FC<Props> = () => {
  const { handleAuthAction, setAuthUser } = useContext(AuthContext)
  const { register, handleSubmit, errors } = useForm<SigninArgs>()

  const router = useRouter()

  const [signin, { loading, error }] = useMutation<
    { signin: User },
    SigninArgs
  >(SIGN_IN)

  const submitSignin = handleSubmit(async ({ email, password }) => {
    try {
      const response = await signin({
        variables: { email, password },
      })
      if (response?.data) {
        const { signin } = response.data
        if (signin) {
          // Close the form
          handleAuthAction('close')
          // Set the loggedInUser in the context api
          setAuthUser(signin)
          // Push the user to their dashboard
          if (isAdmin(signin)) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      setAuthUser(null)
    }
  })

  return (
    <Modal>
      <FormContainer>
        <Header>
          <h2>Sign In</h2>
        </Header>

        <Divider />

        <StyledForm onSubmit={submitSignin}>
          <p className="email_section_label">or sign in with an email</p>
          <InputContainer>
            <label>Email</label>

            <Input
              type="text"
              name="email"
              id="email"
              placeholder="Your email"
              autoComplete="new-password"
              ref={register({
                required: 'Email is required.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email is invalid.',
                },
              })}
            />
            <ErrorMessage errors={errors} name="email">
              {({ message }) => <StyledError>{message}</StyledError>}
            </ErrorMessage>
          </InputContainer>

          <InputContainer>
            <label>Password</label>

            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Your password"
              ref={register({
                required: 'Password is required.',
              })}
            />
            <ErrorMessage errors={errors} name="password">
              {({ message }) => <StyledError>{message}</StyledError>}
            </ErrorMessage>
          </InputContainer>
          <Button
            disabled={loading}
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (
              <Loader
                type="Oval"
                color="white"
                height={30}
                width={30}
                timeout={3000}
              />
            ) : (
              'Submit'
            )}
          </Button>
          <StyledError>
            {error &&
              (error.graphQLErrors[0]?.message
                ? error.graphQLErrors[0]?.message
                : 'Sorry, something went wrong.')}
          </StyledError>
        </StyledForm>
        <StyledSwitchAction>
          <p>
            Don't have an account yet?{' '}
            <span
              style={{ cursor: 'pointer', color: 'red' }}
              onClick={() => handleAuthAction('signup')}
            >
              sign up
            </span>{' '}
            instead.
          </p>
          <p>
            Forgot password? click{' '}
            <span
              style={{ cursor: 'pointer', color: 'red' }}
              onClick={() => handleAuthAction('request')}
            >
              here.
            </span>
          </p>
        </StyledSwitchAction>
      </FormContainer>
    </Modal>
  )
}

export default SignIn
