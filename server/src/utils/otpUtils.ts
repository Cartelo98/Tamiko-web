import { Otp } from "../entities/Otp";
import { AppDataSource } from "../data-source";
import { sendOtpSMS } from "../services/smsService"; // Service pour envoi SMS avec Twilio

export const sendOtp = async (phone: string) => {
  const otp = generateOtp();
  const otpRepository = AppDataSource.getRepository(Otp);

  const otpRecord = otpRepository.create({
    phone,
    otp,
    expires_at: new Date(Date.now() + 10 * 60 * 1000) // expiration dans 10 minutes
  });

  await otpRepository.save(otpRecord);

  // Envoi OTP via SMS (Twilio ou autre)
  await sendOtpSMS(phone, otp);

  return otp;
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
