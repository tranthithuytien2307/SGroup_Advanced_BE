import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Board } from "./board.entity";
import { Card } from "./card.entity";
@Entity("board_lists")
export class ListCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  board_id!: number;

  @ManyToOne(() => Board, (b) => b.lists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "board_id" })
  board!: Board;

  @Column()
  name!: string;

  @Column({ default: 0 })
  position!: number;

  @OneToMany(() => Card, (c) => c.list)
  cards!: Card[];
}
