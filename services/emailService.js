const nodemailer = require("nodemailer");
// const { OAuth2 } = require("google-auth-library");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


const sendEmail = async (user, subject, html) => {
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  });
  const accessToken = oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.user,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const message = {
    from: `Kukkari ${process.env.user}`,
    to: user.email,
    subject,
    html,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Email sent to: ${user.email}`);
  } catch (error) {
    console.error(`Failed to send email to: ${user.email}`, error);
  }
};

module.exports = { sendEmail };