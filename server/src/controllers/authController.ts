import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { sendVerificationEmail } from "../services/emailService";
import { Role } from "../entities/Role";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { sendOtp } from "../utils/otpUtils";
import * as bcrypt from 'bcrypt';

// Fonction d'inscription
export const register = async (req: Request, res: Response) => {
    // Vérification des erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, confirmPassword, accepted_terms, country_code } = req.body;

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }

    // Vérification que l'acceptation des conditions est bien passée
    if (!accepted_terms) {
        return res.status(400).json({ message: "Vous devez accepter les termes et conditions." });
    }

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "L'email est déjà utilisé." });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Récupérer le rôle (CLIENT dans ce cas)
    const userRole = await roleRepository.findOne({ where: { name: 'CLIENT' } });
    if (!userRole) {
        return res.status(400).json({ message: "Rôle non trouvé." });
    }

    // Créer un nouvel utilisateur
    const newUser = userRepository.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: userRole,
        accepted_terms, // Accepter les termes venant de la requête
        country_code,
        is_verified: false,
    });

    // Sauvegarder l'utilisateur dans la base de données
    await userRepository.save(newUser);

    // Vérifiez si JWT_SECRET est défini
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ message: "JWT secret not defined in environment variables" });
    }

    // Envoi de l'email de vérification
    const verificationToken = jwt.sign({ email: newUser.email }, secret, { expiresIn: "1d" });
    await sendVerificationEmail(newUser.email, verificationToken);  // Implémenter sendVerificationEmail

    // Réponse avec succès
    res.status(201).json({ message: "Utilisateur créé. Vérifiez votre email." });
};


  
  // Fonction de connexion avec email
  export const loginEmail = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email }, relations: ['role'] });
  
    // Vérification si l'utilisateur existe et si son rôle est défini
    if (!user || !user.role) {
      return res.status(400).json({ message: "Utilisateur non trouvé ou rôle manquant" });
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }
  
    // Générer le token JWT avec un rôle défini
    const token = jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  
    // Retourner la réponse avec le token
    res.json({ message: "Connecté avec succès", token });
  };
  // Fonction de connexion avec numéro de téléphone
  export const loginPhone = async (req: Request, res: Response) => {
    const { phone } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ phone });
  
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }
  
    const otp = await sendOtp(phone); // Fonction d'envoi OTP via Twilio
  
    res.json({ message: "OTP envoyé", otp });
  };


// Fonction pour oublier le mot de passe
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Vérification si l'email existe dans la base de données
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Création du token pour la réinitialisation du mot de passe
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1h", // Token valide pendant 1 heure
    });

    // Envoi de l'email avec le lien de réinitialisation
    await sendVerificationEmail(
      email,
      resetToken
    ); // Assurez-vous que cette fonction génère un lien avec le token

    res.status(200).json({
      message: "Un email de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Une erreur est survenue." });
  }
};


// Fonction pour mettre à jour le mot de passe
export const updatePassword = async (req: Request, res: Response) => {
    const { token, newPassword, confirmPassword } = req.body;
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }
  
    try {
      // Vérification du token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  
      // Vérifier si l'email existe dans la base de données
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ email: decoded.email });
  
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
  
      // Hachage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Mise à jour du mot de passe dans la base de données
      user.password = hashedPassword;
      await userRepository.save(user);
  
      res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Token invalide ou expiré." });
    }
  };

  export const verifyEmail = async (req: Request, res: Response) => {
    const { verificationToken } = req.body;
  
    if (!verificationToken) {
      return res.status(400).json({ message: "Token de vérification manquant." });
    }
  
    try {
      // Vérifier si le token est valide
      const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET as string);
  
      if (typeof decoded === 'string') {
        return res.status(400).json({ message: "Token invalide." });
      }
  
      const { email } = decoded;
  
      const userRepository = AppDataSource.getRepository(User);
  
      // Vérifier si l'utilisateur existe dans la base de données
      const user = await userRepository.findOne({ where: { email } });
  
      if (!user) {
        return res.status(400).json({ message: "Utilisateur non trouvé." });
      }
  
      // Mettre à jour l'utilisateur comme vérifié
      user.is_verified = true;
      await userRepository.save(user);
  
      res.status(200).json({ message: "Email vérifié avec succès." });
    } catch (error: unknown) {
      // Gestion des erreurs avec type 'unknown'
      if (error instanceof Error) {
        res.status(500).json({ message: "Erreur lors de la vérification de l'email.", error: error.message });
      } else {
        res.status(500).json({ message: "Erreur inconnue lors de la vérification de l'email." });
      }
    }
  };

  // Fonction pour vérifier l'OTP
export const verifyOtp = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
  
    if (!phone || !otp) {
      return res.status(400).json({ message: "Numéro de téléphone ou OTP manquant." });
    }
  
    const otpRepository = AppDataSource.getRepository(otp);
  
    // Chercher le code OTP dans la base de données
    const otpRecord = await otpRepository.findOne({ where: { phone, otp } });
  
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP incorrect." });
    }
  
    const currentDate = new Date();
  
    // Vérifier si l'OTP a expiré
    if (otpRecord.expires_at < currentDate) {
      return res.status(400).json({ message: "OTP expiré." });
    }
  
    // OTP vérifié avec succès
    res.status(200).json({ message: "OTP vérifié avec succès." });
  };