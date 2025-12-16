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
export class List {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  board_id!: number;

  @ManyToOne(() => Board, (b) => b.lists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "board_id" })
  board!: Board;

  @Column()
  name!: string;

  @Column({ type: "float", default: 0 })
  position!: number;

  @Column({ nullable: true })
  cover_url!: string;

  @Column({ default: false })
  is_archived!: boolean;

  @Column({ type: "timestamp", nullable: true })
  archived_at!: Date | null;

  @OneToMany(() => Card, (c) => c.list)
  cards!: Card[];
}
