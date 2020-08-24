import React from 'react'
import GoogleLogin from 'react-google-login'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  cb: (response: any) => void
  cssClass: string
}

const GoogleLoginButton = ({ cb, cssClass }: Props) => {
  return (
    <GoogleLogin
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      buttonText='Login with Google'
      onSuccess={cb}
      onFailure={cb}
      cookiePolicy={'single_host_origin'}
      className={cssClass}
      render={(renderProps) => (
        <button className='google' onClick={renderProps.onClick}>
          <FontAwesomeIcon icon={['fab', 'google']} />
          Login with Google
        </button>
      )}
      icon={false}
    />
  )
}

export default GoogleLoginButton
