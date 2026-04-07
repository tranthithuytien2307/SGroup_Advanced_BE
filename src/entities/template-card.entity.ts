import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { TemplateList } from "./template-list.entity";

@Entity("template_cards")
export class TemplateCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  list_id!: number;

  @ManyToOne(() => TemplateList, (l) => l.cards, { onDelete: "CASCADE" })
  @JoinColumn({ name: "list_id" })
  list!: TemplateList;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
