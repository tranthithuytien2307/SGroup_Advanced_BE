import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { BoardTemplate } from "./template.entity";
import { TemplateCard } from "./template-card.entity";

@Entity("template_lists")
export class TemplateList {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  template_id!: number;

  @ManyToOne(() => BoardTemplate, (t) => t.lists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "template_id" })
  template!: BoardTemplate;

  @Column()
  name!: string;

  @Column({ default: 0 })
  position!: number;

  @OneToMany(() => TemplateCard, (c) => c.list)
  cards!: TemplateCard[];
}
