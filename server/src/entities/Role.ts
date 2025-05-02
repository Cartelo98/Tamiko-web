import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { User } from "./User";

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  name!: string;
}
