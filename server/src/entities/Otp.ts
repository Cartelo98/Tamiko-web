import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("otp")
export class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20 })
  phone!: string;  // Assurez-vous que cette colonne existe

  @Column({ type: "varchar", length: 6 })
  otp!: string;

  @Column({ type: "timestamp" })
  expires_at!: Date;
}
