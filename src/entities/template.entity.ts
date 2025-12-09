import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { TemplateList } from "./template-list.entity";
@Entity("board_templates")
export class Template {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  created_by_id!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "varchar", nullable: true })
  cover_url!: string | null; // Background image URL

  @Column({ type: "varchar", nullable: true })
  theme!: string | null; // Background color

  @ManyToOne(() => User, (u) => u.templates, { onDelete: "SET NULL" })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({ default: false })
  is_archived!: boolean;

  @Column({ type: "timestamp", nullable: true })
  archived_at!: Date | null;

  @OneToMany(() => TemplateList, (l) => l.template)
  lists!: TemplateList[];

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;
}
