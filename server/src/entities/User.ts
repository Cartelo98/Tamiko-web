import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import bcrypt from 'bcryptjs';
import { Role } from "./Role";  // Assurez-vous que le modèle de Role est bien défini.

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  country_code?: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  // Relation Many-to-One avec le modèle Role
  @ManyToOne(() => Role, { eager: true })  // Eager loading for the role
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Column({ type: 'boolean', default: false })
  accepted_terms?: boolean;

  @Column({ type: 'varchar', nullable: true })
  verification_token?: string;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  // Timestamps
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  // Hashage du mot de passe avant l'insertion ou la mise à jour
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Comparaison du mot de passe pour la connexion
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
