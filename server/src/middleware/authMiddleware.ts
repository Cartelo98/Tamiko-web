import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "../middleware/errorHandler";  // Assurez-vous d'avoir un gestionnaire d'erreurs

// Interface pour représenter les données utilisateur dans le token JWT
interface DecodedJwt {
  userId: number;  // Définissez les propriétés du token
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedJwt;  // Déclarez le type `user` sur `Request`
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return next(new ErrorHandler("Access denied. No token provided.", 403));

  try {
    // Décodez le token et ajoutez `userId` à `req.user`
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedJwt;
    req.user = decoded; // L'utilisateur décodé est ajouté ici

    // Vérifier si `userId` existe sur `req.user`
    if (!req.user || !req.user.userId) {
      return next(new ErrorHandler("Invalid token.", 400));
    }

    next();
  } catch (error) {
    next(new ErrorHandler("Invalid token.", 400));
  }
};
