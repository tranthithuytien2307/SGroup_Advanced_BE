import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Workspace } from "./workspace.entity";
import { User } from "./user.entity";

@Entity("workspace_invitations")
export class WorkspaceInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.invitations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @Column()
  workspace_id!: number;

  @Column({ default: "pending" })
  status!: "pending" | "accepted" | "expired";

  @Column({ type: "varchar" })
  token!: string;

  @ManyToOne(() => User, (user) => user.sentInvitations, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "invited_by" })
  invited_by!: User | null;

  @Column({ type: "int", nullable: true })
  invited_by_id!: number | null;

  @CreateDateColumn()
  created_at!: Date;
}
