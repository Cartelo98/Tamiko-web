import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Role } from "./entities/Role";
import { Otp } from "./entities/Otp";
import { config } from "dotenv";

// Charger les variables d'environnement
config();

// Créer la source de données pour PostgreSQL
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "auth_db",
  synchronize: true,  // Si vous souhaitez que TypeORM synchronise automatiquement les entités
  logging: false,
  entities: [User, Role, Otp],
  migrations: [],
  subscribers: [],
});
