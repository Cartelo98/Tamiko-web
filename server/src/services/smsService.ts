import twilio from "twilio";

// Initialiser Twilio avec vos clés API
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendOtpSMS = async (phone: string, otp: string) => {
  try {
    await client.messages.create({
      body: `Votre code OTP est : ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log("OTP envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'OTP :", error);
    throw new Error("Impossible d'envoyer l'OTP");
  }
};
