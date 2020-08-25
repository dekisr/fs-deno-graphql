import { config } from '../deps/dotenv.ts'
import { SmtpClient } from '../deps/smtp.ts'

const { SENDINBLUE_SMTP_KEY, SENDINBLUE_SMTP_USER } = config()

export const sendEmail = async (
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string
) => {
  try {
    const client = new SmtpClient()

    await client.connect({
      hostname: 'smtp-relay.sendinblue.com',
      port: 587,
      username: SENDINBLUE_SMTP_USER,
      password: SENDINBLUE_SMTP_KEY,
    })
    await client.send({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      content: html,
    })

    await client.close()
    return { ok: true }
  } catch (error) {
    return { ok: false, error }
  }
}

// const { SENDGRID_API_ENDPOINT, SENDGRID_API_KEY } = config()

// export const sendEmail = async (
//   fromEmail: string,
//   toEmail: string,
//   subject: string,
//   html: string
// ) => {
//   const message = {
//     personalizations: [
//       {
//         to: [
//           {
//             email: toEmail,
//           },
//         ],
//         subject,
//       },
//     ],
//     from: {
//       email: fromEmail,
//     },
//     content: [
//       {
//         type: 'text/html',
//         value: html,
//       },
//     ],
//   }

//   const response = await fetch(SENDGRID_API_ENDPOINT, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${SENDGRID_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   })

//   return response
// }
