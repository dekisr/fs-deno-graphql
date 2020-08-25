import React from 'react'
import { useForm, ErrorMessage } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import Loader from 'react-loader-spinner'

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
import { REQUEST_TO_RESET_PASSWORD } from '../apollo/mutations'

interface Props {}

const RequestResetPassword: React.FC<Props> = () => {
  const { register, handleSubmit, errors } = useForm<{ email: string }>()

  const [requestToResetPassword, { loading, error, data }] = useMutation<
    {
      requestToResetPassword: { message: string }
    },
    { email: string }
  >(REQUEST_TO_RESET_PASSWORD)

  const submitRequestResetPassword = handleSubmit(async ({ email }) => {
    await requestToResetPassword({ variables: { email } })
  })

  return (
    <Modal>
      <FormContainer>
        <Header>
          <h4>Enter your email below to reset password.</h4>
        </Header>
        <StyledForm onSubmit={submitRequestResetPassword}>
          <InputContainer>
            <label>Email</label>

            <Input
              type="text"
              name="email"
              id="email"
              placeholder="Your email"
              autoComplete="your-email"
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
            <p>{data.requestToResetPassword?.message}</p>
          </StyledInform>
        )}
      </FormContainer>
    </Modal>
  )
}

export default RequestResetPassword
