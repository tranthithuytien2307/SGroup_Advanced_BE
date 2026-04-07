import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Board } from "./board.entity";
import { User } from "./user.entity";

export type BoardRole = "admin" | "member" | "viewer";

@Entity("board_invitations")
export class BoardInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Board, { onDelete: "CASCADE" })
  @JoinColumn({ name: "board_id" })
  board!: Board;

  @Column()
  email!: string;

  @Column()
  token!: string;

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "expired"],
    default: "pending",
  })
  status!: "pending" | "accepted" | "expired";

  @Column({
    type: "enum",
    enum: ["admin", "member", "viewer"],
    default: "member",
  })
  role!: BoardRole;

  @ManyToOne(() => User)
  @JoinColumn({ name: "inviter_id" })
  inviter!: User;

  @Column()
  inviter_id!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;
}
