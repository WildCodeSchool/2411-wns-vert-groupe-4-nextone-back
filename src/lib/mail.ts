import { google } from "googleapis";
import nodeMailer from "nodemailer";

const oauth2Client = new google.auth.OAuth2({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI!,
});

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
});

const mailPatterns = {
  RESET_PASSWORD: {
    subject: "Renouvellement du mot de passe",
    intro:
      " Une demande de réinitialisation de mot de passe a été effectué avec cette adresse email.",
    endURL: "resetpassword",
    buttonText: "Renouveller mon mot de passe",
  },
  CREATE_INVITATION: {
    subject: "Création de compte",
    intro:
      "Vous avez reçu une invitation vous permettant de créer un compte NextONE. Celle ci est valable 24h.",
    endURL: "create",
    buttonText: "Créer mon compte",
  },
  RENEW_INVITATION: {
    subject: "Renouvellement de l'invitation",
    intro: "Votre invitation a été renouvellée pour une durée de 24h.",
    endURL: "create",
    buttonText: "Créer mon compte",
  },
};

export type TMail = keyof typeof mailPatterns;

export const sendMail = async (
  email: string,
  token: string,
  type: TMail
): Promise<boolean> => {
  // const uri =
  //   process.env.NODE_ENV !== "dev"
  //     ? "https://david4.wns.wilders.dev"
  //     : "https://localhost:3000";

  const uri = "http://localhost:4000";

  try {
    console.log("Sending mail to :", email, " of type ", type);
    console.log("Link :", `${uri}/join/${token}`);
    const ACCESS_TOKEN = await oauth2Client.getAccessToken();
    const transport = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,

      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_ADDRESS!,
        accessToken: ACCESS_TOKEN.token!,
      },
    });

    const mailOptions = {
      from: "next.one.gr'@gmail.com",
      to: email,
      subject: mailPatterns[type].subject,
      html: `
        <body>
    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: start;
        margin: auto;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px -1px #a4acb9;
        max-width: 600px;
        font-family: sans-serif;
      "
    >
      <div
        style="
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: start;
          padding-left: 1rem;
          row-gap: 3;
          background-color: #e6efef;
          border-radius: 10px 10px 0 0;
        "
      >
        <img src="cid:logo" height="40px" width="40px" alt="NextONE" Logo />
        <h1 style="color: #1f2511; font-weight: bolder">NextONE</h1>
      </div>
      <div
        style="
          color: #6d6d6d;
          display: flex;
          flex-direction: column;
          align-items: start;
          padding: 2rem;
          font-size: 0.9rem;
        "
      >
        <p>
          ${mailPatterns[type].intro}
        </p>
        <p style="font-weight: bold">
          Pour finaliser la la demande, merci de cliquer sur le lien ci-dessous
        </p>
      </div>
      <a
        style="
          padding: 0.7rem;
          border-radius: 10px;
          background-color: #1f2511;
          border: none;
          color: white;
          font-weight: bold;
          text-decoration: none;
          align-self: center;
        "
        target="_blank"
        href="${uri}/${mailPatterns[type].endURL}/${token}"
      >
        ${mailPatterns[type].buttonText}
      </a>
      <p
        style="
          font-size: 0.6rem;
          color: gray;
          font-style: italic;
          padding-bottom: 1rem;
          margin: auto;
        "
      >
        Ceci est un email automatique; merci de ne pas y répondre
      </p>
    </div>
  </body>
  
      `,
      attachments: [
        {
          filename: "nextone-green.svg",
          path: "src/assets/nextone-green.svg",
          cid: "logo",
        },
      ],
    };
    await transport.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error("ERROR SEND MAIL : ", error?.message);
    return false;
  }
};
