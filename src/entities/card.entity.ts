import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  VersionColumn,
} from "typeorm";
import { List } from "./list.entity";
import { Label } from "./label.entity";
import { Checklist } from "./checklist.entity";
import { Comment } from "./comment.entity";
import { CardMember } from "./card-member.entity";

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

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
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

  @Column({ type: "varchar", length: 20, nullable: true })
  cover_color!: string | null;

  @Column({ nullable: true })
  cover_image_url!: string;

  @Column({ type: "text", nullable: true })
  cover_url!: string | null;

  @VersionColumn({ default: 1 })
  version!: number;

  @OneToMany(() => CardMember, (member) => member.card)
  members!: CardMember[];

  @OneToMany(() => Comment, (comment) => comment.card)
  comments!: Comment[];
}
