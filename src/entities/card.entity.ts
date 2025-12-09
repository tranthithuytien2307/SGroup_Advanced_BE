import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ListCard } from "./list-card.entity";

@Entity("cards")
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  list_id!: number;

  @ManyToOne(() => ListCard, (l) => l.cards, { onDelete: "CASCADE" })
  @JoinColumn({ name: "list_id" })
  list!: ListCard;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
