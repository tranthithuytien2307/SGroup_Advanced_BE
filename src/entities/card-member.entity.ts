import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Card } from "./card.entity";
import { User } from "./user.entity";

@Entity("card_members")
export class CardMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  card_id!: number;

  @ManyToOne(() => Card, (card) => card.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "card_id" })
  card!: Card;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, (user) => user.cardMemberships, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
