import { Request, Response, NextFunction } from "express";

// Classe personnalisée pour la gestion des erreurs
export class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

// Middleware pour capturer les erreurs
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof ErrorHandler ? err.statusCode : 500;
  const message = err instanceof ErrorHandler ? err.message : "Internal Server Error";

  // Log de l'erreur pour le développement
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Envoi de la réponse avec le message d'erreur
  res.status(statusCode).json({
    success: false,
    message,
  });
};
