import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BoardList } from "./board-list.entity";

@Entity("board_cards")
export class BoardCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  list_id!: number;

  @ManyToOne(() => BoardList, (l) => l.cards, { onDelete: "CASCADE" })
  @JoinColumn({ name: "list_id" })
  list!: BoardList;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
