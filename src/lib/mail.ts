import { google } from "googleapis"
import nodeMailer from "nodemailer"

// const oauth2Client = new google.auth.OAuth2({
//   client_id: process.env.GOOGLE_CLIENT_ID!,
//   client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//   redirectUri: process.env.GOOGLE_REDIRECT_URI!
// })

// oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN! })


export const sendMail = async (email: string, token:string): Promise<boolean> => {
  // const ACCESS_TOKEN = await oauth2Client.getAccessToken()
  const transport = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_ADDRESS!,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
      // accessToken: ACCESS_TOKEN
    },
    tls: {
      rejectUnauthorized: true
    }
  })

  const uri = process.env.NODE_ENV !== "dev" ? "https://david4.wns.wilders.dev" : "https://localhost:3000"
  console.log("URI : ", uri, process.env.NODE_ENV)
  const mailOptions = {
    from: "next.one.gr'@gmail.com",
    to: email,
    subject: 'Renouvellement de mot de passe',
    text: 'Une demande de renouvellement de mot de passe a été effectué avec votre adresse email.', 
    html: `
    <h1>NextONE</h1>
    <p>Une demande de réinitialisation de mot de passe a été effectué avec cette adresse email.</p>
    <p>Pour finaliser la la demande, merci de cliquer sur ce <a target="_blank" href="${uri}/resetpassword/${token}">lien</></p>
    `
  }
  try {
    await transport.sendMail(mailOptions)
    // console.log("REPSONSE : ", response)
    return true
  } catch (error:any) {
    console.error('ERROR SEND MAIL : ', error?.message)
    return false
  }
  
}