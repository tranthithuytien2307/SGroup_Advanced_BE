import { AppDataSource } from "../data-source";
import templateModel from "../model/template.model";
import { TemplateList } from "../entities/template-list.entity";
import { TemplateCard } from "../entities/template-card.entity";
import { ListCard } from "../entities/list-card.entity";
import { Card } from "../entities/card.entity";
import { Board } from "../entities/board.entity";
import {
  InternalServerError,
  NotFoundError,
  ForbiddenError,
} from "../handler/error.response";
import workspaceMemberModel from "../model/workspace-member.model";
import boardModel from "../model/board.model";
import listCardModel from "../model/list-card.model";
import cardModel from "../model/card.model";

class TemplateService {
  async getAll() {
    try {
      return await templateModel.getActiveTemplates();
    } catch (error) {
      console.error("Template error:", error);
      throw new InternalServerError("Failed to fetch templates");
    }
  }

  async createBoardFromTemplate(params: {
    templateId: number;
    ownerId: number;
    boardName?: string;
    workspaceId: number;
    visibility?: "private" | "workspace" | "public";
  }) {
    const { templateId, ownerId, workspaceId, boardName, visibility } = params;

    const template = await templateModel.findByIdWithLists(templateId);
    if (!template) throw new NotFoundError("Template not found");

    if (!workspaceId) throw new NotFoundError("Not found workspaceId");

    const isMember = await workspaceMemberModel.isUserMember(
      workspaceId,
      ownerId
    );
    if (!isMember)
      throw new ForbiddenError("User is not member of this workspace");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const board = await boardModel.createBoardFromTemplate(
        manager,
        boardName || template.name,
        workspaceId,
        ownerId,
        visibility || "private"
      );

      const listMap = await listCardModel.createListsFromTemplate(
        manager,
        board.id,
        template.lists || []
      );

      await cardModel.createCardsFromTemplate(
        manager,
        listMap,
        template.lists || []
      );

      await queryRunner.commitTransaction();
      return board;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

export default new TemplateService();
