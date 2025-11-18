import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Board } from "./board.entity";

export type BoardRole = "admin" | "member" | "viewer";

@Entity("board_members")
export class BoardMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.workspaceMemberships, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Board, (board) => board.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "board_id" })
  board!: Board;

  @Column({
    type: "enum",
    enum: ["admin", "member", "viewer"],
    default: "member",
  })
  role!: BoardRole;
}
