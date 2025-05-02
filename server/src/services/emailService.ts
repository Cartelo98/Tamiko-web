import nodemailer from "nodemailer";

// Configuration de l'email
 const transporter = nodemailer.createTransport({
  service: "gmail",  // Exemple avec Gmail
  auth: {
    user: process.env.EMAIL_USER,  // Votre adresse email
    pass: process.env.EMAIL_PASS,  // Votre mot de passe
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'TAMIKO Vérification de votre adresse e-mail',
    text: `Veuillez cliquer sur ce lien pour vérifier votre adresse email : ${process.env.FRONTEND_URL}/verify-email?token=${token}`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de vérification", error);
  }
};
