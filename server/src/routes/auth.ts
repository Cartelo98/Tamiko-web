import express from 'express';
import { check } from 'express-validator';
import { register, loginEmail, loginPhone, verifyEmail, verifyOtp } from "../controllers/authController";
import { authMiddleware } from '../middleware/authMiddleware';
import { getProfile } from '../controllers/userController';
import { forgotPassword, updatePassword } from "../controllers/authController"; // Import des autres fonctions si nécessaire

const router = express.Router();

// Route d'inscription
router.post('/register', [
  check('name').notEmpty(),
  check('email').isEmail(),
  check('phone').isMobilePhone('any', { strictMode: false }).withMessage('Numéro de téléphone invalide'),
  check('password').isLength({ min: 6 }),
  check('confirmPassword').custom((value, { req }) => value === req.body.password)
], register);  // Appel de la fonction register depuis le controller

// Route de connexion avec email
router.post('/login/email', loginEmail);  // Appel de la fonction loginEmail depuis le controller

// Route de connexion avec numéro
router.post('/login/phone', loginPhone);  // Appel de la fonction loginPhone depuis le controller

// Route pour oublier le mot de passe
router.post("/forgot-password", forgotPassword);  // Ajoutez votre logique de mot de passe oublié

// Route pour mettre à jour le mot de passe
router.post("/update-password", updatePassword);  // Ajoutez votre logique de mise à jour du mot de passe

// Route pour la vérification de l'email
router.post("/verify-email", verifyEmail);

// Route pour la vérification de l'OTP
router.post("/verify-otp", verifyOtp);

router.post("/forgot-password", forgotPassword);
router.post("/update-password", updatePassword);

// Profil utilisateur (avec authentification)
router.get("/profile", authMiddleware, getProfile);


export { router };
