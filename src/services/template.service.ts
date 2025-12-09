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

class TemplateService {
  async getAll() {
    try {
      return await templateModel.getAll();
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

    const template = await templateModel.findById(templateId);
    if (!template) throw new NotFoundError("Template not found");

    if (!workspaceId) throw new NotFoundError("Not found workspaceId");

    const isMember = await templateModel.isUserMember(workspaceId, ownerId);
    if (!isMember)
      throw new ForbiddenError("User is not owner/admin of this workspace");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boardRepo = queryRunner.manager.getRepository(Board);
      const newBoard = boardRepo.create({
        name: boardName || template.name,
        created_by_id: ownerId,
        workspace_id: workspaceId,
        visibility: visibility || "private",
      } as Partial<Board>);
      const savedBoard = await boardRepo.save(newBoard);

      const ListCardRepo = queryRunner.manager.getRepository(ListCard);
      const boardCardRepo = queryRunner.manager.getRepository(Card);

      const listMap = new Map<number, number>();

      const listsToCreate = (template.lists || []).map((tl: TemplateList) =>
        ListCardRepo.create({
          board_id: savedBoard.id,
          name: tl.name,
          position: tl.position,
        } as Partial<ListCard>)
      );
      const createdLists = await ListCardRepo.save(listsToCreate);

      createdLists.forEach((bl, idx) => {
        const tplId = template.lists[idx].id;
        listMap.set(tplId, bl.id);
      });

      const cardsToCreate: Partial<Card>[] = [];
      for (const tplList of template.lists) {
        const newListId = listMap.get(tplList.id);
        if (!newListId) continue;
        for (const card of tplList.cards || []) {
          cardsToCreate.push(
            boardCardRepo.create({
              list_id: newListId,
              title: card.title,
              description: card.description,
            } as Partial<Card>)
          );
        }
      }
      if (cardsToCreate.length > 0) {
        await boardCardRepo.save(cardsToCreate);
      }

      await queryRunner.commitTransaction();
      return savedBoard;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

export default new TemplateService();
