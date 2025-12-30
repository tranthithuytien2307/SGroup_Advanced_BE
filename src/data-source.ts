import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/user.entity";
import { Workspace } from "./entities/workspace.entity";
import { Board } from "./entities/board.entity";
import { WorkspaceMember } from "./entities/workspace-member.entity";
import { WorkspaceInvitation } from "./entities/workspace-invitations.entity";
import { BoardMember } from "./entities/board-member.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { RolePermission } from "./entities/role-permission.entity";
import { BoardInvitation } from "./entities/board_invitations.entity";
import { List } from "./entities/list.entity";
import { Card } from "./entities/card.entity";
import { TemplateBoard } from "./entities/template-board.entity";
import { TemplateList } from "./entities/template-list.entity";
import { TemplateCard } from "./entities/template-card.entity";
import { Label } from "./entities/label.entity";
import { Checklist } from "./entities/checklist.entity";
import { ChecklistItem } from "./entities/checklist-item.entity";
import { CardMember } from "./entities/card-member.entity";
import { Comment } from "./entities/comment.entity";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: process.env.POSTGRESQL_PASSWORD,
  database: "mydb",
  synchronize: true,
  logging: true,
  entities: [
    User,
    Workspace,
    Board,
    WorkspaceMember,
    BoardMember,
    WorkspaceInvitation,
    Role,
    Permission,
    RolePermission,
    BoardInvitation,
    List,
    Card,
    CardMember,
    Comment,
    TemplateBoard,
    TemplateList,
    TemplateCard,
    Label,
    Checklist,
    ChecklistItem,
  ],
});
