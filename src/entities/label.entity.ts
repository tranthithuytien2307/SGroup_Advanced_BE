import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Card } from "./card.entity";

@Entity("labels")
export class Label {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  name!: string | null;

  @Column()
  color!: string;

  @Column()
  board_id!: number;

  @ManyToMany(() => Card, (card) => card.labels)
  cards!: Card[];
}
