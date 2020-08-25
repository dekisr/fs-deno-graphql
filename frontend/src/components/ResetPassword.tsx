import React, { useContext } from 'react'
import { useMutation } from '@apollo/client'
import { useForm, ErrorMessage } from 'react-hook-form'
import Loader from 'react-loader-spinner'
import { useRouter } from 'next/router'

import Modal from './modal/Modal'
import {
  FormContainer,
  Header,
  StyledForm,
  InputContainer,
  Input,
  Button,
  StyledError,
  StyledInform,
} from './SignUp'
import { RESET_PASSWORD } from '../apollo/mutations'
import { AuthContext } from '../context/AuthContextProvider'

const ResetPassword: React.FC<{ token: string }> = ({ token }) => {
  const { handleAuthAction } = useContext(AuthContext)
  const { register, handleSubmit, errors } = useForm<{ password: string }>()

  const router = useRouter()

  const [resetPassword, { loading, error, data }] = useMutation<
    { resetPassword: { message: string } },
    { password: string; token: string }
  >(RESET_PASSWORD)

  const submitResetPassword = handleSubmit(async ({ password }) => {
    const response = await resetPassword({ variables: { password, token } })
    if (response?.data?.resetPassword?.message) {
      router.replace('/')
    }
  })

  return (
    <Modal>
      <FormContainer>
        <Header>
          <h4>Enter your new password below.</h4>
        </Header>
        <StyledForm onSubmit={submitResetPassword}>
          <InputContainer>
            <label>Password</label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Your password"
              ref={register({
                required: 'Password is required.',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters.',
                },
                maxLength: {
                  value: 30,
                  message: 'Password cannot be greater than 30 characters.',
                },
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
          {error && (
            <StyledError>
              {error.graphQLErrors[0]?.message ||
                'Sorry, something went wrong.'}
            </StyledError>
          )}
        </StyledForm>
        {data && (
          <StyledInform>
            <p>
              {data.resetPassword?.message}{' '}
              <span
                style={{ cursor: 'pointer', color: 'red' }}
                onClick={() => handleAuthAction('signin')}
              >
                sign in
              </span>
            </p>
          </StyledInform>
        )}
      </FormContainer>
    </Modal>
  )
}

export default ResetPassword
