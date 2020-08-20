import { config } from '../deps/dotenv.ts'

const { SENDGRID_API_ENDPOINT, SENDGRID_API_KEY } = config()

export const sendEmail = async (
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string
) => {
  const message = {
    personalizations: [
      {
        to: [
          {
            email: toEmail,
          },
        ],
        subject,
      },
    ],
    from: {
      email: fromEmail,
    },
    content: [
      {
        type: 'text/html',
        value: html,
      },
    ],
  }

  const response = await fetch(SENDGRID_API_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  return response
}
