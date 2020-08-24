import React from 'react'
import FacebookLogin from 'react-facebook-login'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  cb: (response: any) => void
  cssClass: string
}

const FbIcon = <FontAwesomeIcon icon={['fab', 'facebook-f']} size='lg' />

const FBLoginButton = ({ cb, cssClass }: Props) => {
  return (
    <FacebookLogin
      appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!}
      fields='name,email'
      scope='public_profile, email'
      callback={cb}
      cssClass={cssClass}
      icon={FbIcon}
    />
  )
}

export default FBLoginButton
