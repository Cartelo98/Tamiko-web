import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import { router } from "./routes/auth";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import { Role } from "./entities/Role"; // Importer l'entité Role
import cors from 'cors';

dotenv.config();

// Créer l'application Express
const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());
// CORS middleware
app.use(cors({
  origin: 'http://localhost:4200', // L'adresse de votre frontend Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Fonction pour ajouter les rôles par défaut lors du démarrage
const createDefaultRoles = async () => {
  const roleRepository = AppDataSource.getRepository(Role);

  // Vérifie si les rôles existent déjà
  const existingRoles = await roleRepository.find();

  if (existingRoles.length === 0) {
    const roles = [
      { name: 'CLIENT' },
      { name: 'VENDEUR' },
      { name: 'ADMIN' }
    ];

    // Ajoute les rôles par défaut
    await roleRepository.save(roles);
    console.log('Les rôles par défaut ont été créés.');
  } else {
    console.log('Les rôles existent déjà.');
  }
};

// Connexion à la base de données PostgreSQL
AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected!");

    // Appeler la fonction pour créer les rôles par défaut
    await createDefaultRoles();

    // Lancer le serveur après l'initialisation de la base de données
    app.listen(3001, () => {
      console.log("Serveur démarré sur http://localhost:3001");
    });

  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

// Routes de l'authentification
app.use("/api/auth", router);

// Route par défaut
app.get("/", (req: Request, res: Response) => {
  res.send("Bienvenue dans l'API d'authentification !");
});
