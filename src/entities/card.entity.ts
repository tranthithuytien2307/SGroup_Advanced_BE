import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { List } from "./list.entity";
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

  @Column({ type: "float", default: 0 })
  position!: number;
  
  @Column({ default: false })
  is_archived!: boolean;

  @Column({ type: "timestamp", nullable: true })
  archived_at!: Date | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ nullable: true })
  cover_color!: string;

  @Column({ nullable: true })
  cover_image_url!: string;

  @OneToMany(() => CardMember, (member) => member.card)
  members!: CardMember[];

  @OneToMany(() => Comment, (comment) => comment.card)
  comments!: Comment[];
}
