import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Card } from "./card.entity";
import { ChecklistItem } from "./checklist-item.entity";
import { PrimaryGeneratedColumn } from "typeorm";

@Entity("checklists")
export class Checklist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  card_id!: number;

  @ManyToOne(() => Card, (card) => card.checklists, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "card_id" })
  card!: Card;

  @Column()
  title!: string;

  @OneToMany(() => ChecklistItem, (item) => item.checklist)
  items!: ChecklistItem[];
}
