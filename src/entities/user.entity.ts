import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Workspace } from "./workspace.entity";
import { WorkspaceMember } from "./workspace-member.entity";
import { Board } from "./board.entity";
import { WorkspaceInvitation } from "./workspace-invitations.entity";
import { Role } from "./role.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  password!: string | null; // OAuth user can have null password

  @ManyToOne(() => Role)
  @JoinColumn({ name: "roleId" })
  role!: Role;

  @Column({ type: "int" })
  roleId!: number;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  verifyToken!: string | null;

  @Column({ type: "text", nullable: true })
  refreshToken!: string | null;

  // ---- OAuth 2.0 fields ----
  @Column({ type: "varchar", nullable: true })
  provider!: string | null;

  @Column({ type: "varchar", nullable: true })
  provider_id!: string | null;

  @Column({ type: "varchar", nullable: true })
  avatar_url!: string | null;

  @Column({ type: "timestamp", nullable: true })
  last_login!: Date | null;

  @Column({ default: false })
  is_oauth!: boolean;
  // --------------------------

  @OneToMany(() => Workspace, (workspace) => workspace.owner)
  ownedWorkspaces!: Workspace[];

  @OneToMany(() => WorkspaceMember, (member) => member.user)
  workspaceMemberships!: WorkspaceMember[];

  @OneToMany(() => Board, (board) => board.created_by)
  createdBoards!: Board[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @OneToMany(() => WorkspaceInvitation, (inv) => inv.invited_by)
  sentInvitations!: WorkspaceInvitation[];
}
