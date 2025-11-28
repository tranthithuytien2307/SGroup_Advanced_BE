import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Workspace } from "./workspace.entity";
import { User } from "./user.entity";
import { BoardMember } from "./board-member.entity";
import { BoardInvitation } from "./board_invitations.entity";

@Entity("boards")
export class Board {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", nullable: true })
  cover_url!: string | null; // Background image URL

  @Column({ type: "varchar", nullable: true })
  theme!: string | null; // Background color

  @Column({ type: "varchar", nullable: true })
  invite_token!: string | null;

  @Column({ default: false })
  invite_enabled!: boolean;

  @Column({ default: false })
  is_archived!: boolean;

  @Column({ type: "timestamp", nullable: true })
  archived_at!: Date | null;

  @Column({
    type: "enum",
    enum: ["private", "workspace", "public"],
    default: "private",
  })
  visibility!: "private" | "workspace" | "public";

  @ManyToOne(() => Workspace, (workspace) => workspace.boards, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "workspace_id" })
  workspace!: Workspace;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board)
  members!: BoardMember[];

  @OneToMany(() => BoardInvitation, (inv) => inv.board)
  invitations!: BoardInvitation[];

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
}
