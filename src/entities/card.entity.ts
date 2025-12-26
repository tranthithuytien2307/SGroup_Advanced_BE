import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { List } from "./list.entity";

@Entity("cards")
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  list_id!: number;

  @ManyToOne(() => List, (l) => l.cards, { onDelete: "CASCADE" })
  @JoinColumn({ name: "list_id" })
  list!: List;

  @Column()
  title!: string;

  @Column({ type: "float", default: 0 })
  position!: number;
  
  @Column({ default: false })
  is_archived!: boolean;

  @Column({ type: "timestamp", nullable: true })
  archived_at!: Date | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
