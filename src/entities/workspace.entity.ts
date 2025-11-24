import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Board } from "./board.entity";
import { WorkspaceMember } from "./workspace-member.entity";
import { WorkspaceInvitation } from "./workspace-invitations.entity";

@Entity("workspaces")
export class Workspace {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ default: false })
  is_delete!: boolean;

  @Column({ default: true })
  is_active!: boolean;

  @Column({
    type: "varchar",
    enum: ["private", "workspace", "public"],
    default: "private"
  })
  visibility!: "private" | "workspace" | "public";

  @ManyToOne(() => User, (user) => user.ownedWorkspaces, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column()
  owner_id!: number;

  @OneToMany(() => Board, (board) => board.workspace)
  boards!: Board[];

  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members!: WorkspaceMember[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;

  @OneToMany(() => WorkspaceInvitation, (inv) => inv.workspace)
  invitations!: WorkspaceInvitation[];
}
