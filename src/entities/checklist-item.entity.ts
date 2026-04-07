import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Checklist } from "./checklist.entity";

@Entity("checklist_items")
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  checklist_id!: number;

  @ManyToOne(() => Checklist, (checklist) => checklist.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "checklist_id" })
  checklist!: Checklist;

  @Column()
  content!: string;

  @Column({ default: false })
  is_completed!: boolean;
}
