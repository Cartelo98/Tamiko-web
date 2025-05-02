import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

// Récupérer le profil utilisateur
export const getProfile = async (req: Request, res: Response) => {
  // Vérifier que req.user est défini et qu'il contient userId
  if (!req.user || !req.user.userId) {
    return res.status(400).json({ message: "Utilisateur non trouvé ou token invalide." });
  }

  const userId = req.user.userId;  // Maintenant, TypeScript sait que `req.user` existe et contient `userId`

  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId }, relations: ['role'] });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  res.status(200).json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    country_code: user.country_code,
  });
};
