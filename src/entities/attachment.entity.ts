import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Card } from "./card.entity";

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  card_id!: number;

  @ManyToOne(() => Card, { onDelete: "CASCADE" })
  @JoinColumn({ name: "card_id" })
  card!: Card;

  @Column()
  file_name!: string;

  @Column()
  file_url!: string;

  @Column()
  file_type!: string;

  @Column({ default: false })
  is_cover!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;
}
