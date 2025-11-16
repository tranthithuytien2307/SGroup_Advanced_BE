import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Workspace } from "./workspace.entity";
import { User } from "./user.entity";

@Entity("boards")
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", nullable: true })
  cover_url!: string | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.boards, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column()
  workspace_id!: number;

  /** User create board */
  @ManyToOne(() => User, (user) => user.createdBoards, { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by_id" })
  created_by!: User;

  @Column({ type: "int", nullable: true })
  created_by_id!: number | null;

  @Column({ type: "int", nullable: true })
  card_id!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}
