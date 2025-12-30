import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { List } from "./list.entity";
import { Label } from "./label.entity";
import { Checklist } from "./checklist.entity";

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

  @Column({ type: "timestamp", nullable: true })
  strat_date!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  deadline_date!: Date | null;

  @Column({ default: false })
  is_completed!: boolean;

  @ManyToMany(() => Label, (label) => label.cards)
  @JoinTable({
    name: "card_labels",
    joinColumn: { name: "card_id" },
    inverseJoinColumn: { name: "label_id" },
  })
  labels!: Label[];

  @OneToMany(() => Checklist, (checklist) => checklist.card)
  checklists!: Checklist[];
}
