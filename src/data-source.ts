import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config();
import { User } from "./entities/user.entity";
import { Workspace } from "./entities/workspace.entity";
import { Board } from "./entities/board.entity";
import { WorkspaceMember } from "./entities/workspace-member.entity";
import { WorkspaceInvitation } from "./entities/workspace-invitations.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: process.env.POSTGRESQL_PASSWORD,
  database: "mydb",
  synchronize: true,
  logging: true,
  entities: [User, Workspace, Board, WorkspaceMember, WorkspaceInvitation],
});
