import listModel from "../model/list.model";
import boardModel from "../model/board.model";
import cardModel from "../model/card.model";
import {
  BadRequestError,
  ConflictRequestError,
  ErrorResponse,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";
import { List } from "../entities/list.entity";
import { Board } from "../entities/board.entity";
import { AppDataSource } from "../data-source";
import { EntityManager } from "typeorm";

class ListService {
  async getListsByBoard(boardId: number) {
    try {
      const board = await boardModel.getById(boardId);
      if (!board) throw new NotFoundError("Board not found");
      return await listModel.getListsByBoardId(boardId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to fetch lists");
    }
  }

  async createList(boardId: number, name: string, coverUrl?: string) {
    try {
      const board = await boardModel.getById(boardId);
      if (!board) throw new NotFoundError("Board not found");

      const count = await listModel.countListsByBoardId(boardId);

      return await listModel.createList(
        boardId,
        name,
        coverUrl ?? null,
        count + 1,
      );
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to create list");
    }
  }

  async updateList(id: number, data: Partial<List> & { version: number }) {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.cover_url !== undefined) updateData.cover_url = data.cover_url;

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestError("No list fields to update");
      }

      const result = await AppDataSource.getRepository(List)
        .createQueryBuilder()
        .update(List)
        .set({
          ...updateData,
          version: () => `"version" + 1`,
        })
        .where("id = :id AND version = :version", {
          id,
          version: data.version,
        })
        .returning("*")
        .execute();

      if (!result.affected) {
        const exists = await listModel.getListById(id);
        if (!exists) throw new NotFoundError("List not found");
        throw new ConflictRequestError(
          "List was updated by another user. Please refresh and try again.",
        );
      }

      return await listModel.getListById(id);
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new InternalServerError("Failed to update list");
    }
  }

  async deleteList(id: number) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");
      return await listModel.deleteList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to delete list");
    }
  }

  async archiveList(id: number) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");
      list.is_archived = true;
      list.archived_at = new Date();
      return await listModel.updateList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to archive list");
    }
  }

  async unarchiveList(id: number) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");

      list.is_archived = false;
      list.archived_at = null;

      return await listModel.updateList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to unarchive list");
    }
  }

  async moveList(
    id: number,
    newBoardId: number,
    newIndex: number,
    versions: { boardVersion: number; targetBoardVersion?: number },
  ) {
    try {
      const { sourceBoardId, targetBoardId } = await AppDataSource.transaction(
        async (manager) => {
          const listRepo = manager.getRepository(List);
          const boardRepo = manager.getRepository(Board);

          const list = await listRepo.findOne({ where: { id } });
          if (!list) throw new NotFoundError("List not found");

          const targetBoard = await boardRepo.findOne({
            where: { id: newBoardId },
          });
          if (!targetBoard) throw new NotFoundError("Target board not found");

          await this.bumpBoardVersion(manager, list.board_id, versions.boardVersion);

          if (
            newBoardId !== list.board_id &&
            versions.targetBoardVersion === undefined
          ) {
            throw new BadRequestError("Target board version is required");
          }

          if (newBoardId !== list.board_id) {
            await this.bumpBoardVersion(
              manager,
              newBoardId,
              versions.targetBoardVersion!,
            );
          }

          const targetLists = await listRepo.find({
            where: { board_id: newBoardId, is_archived: false },
            order: { position: "ASC" },
          });

          const filteredLists = targetLists.filter((current) => current.id !== id);

          if (newIndex < 0 || newIndex > filteredLists.length) {
            throw new BadRequestError("Invalid new index");
          }

          filteredLists.splice(newIndex, 0, {
            ...list,
            board_id: newBoardId,
          });

          filteredLists.forEach((current, index) => {
            current.position = (index + 1) * 100;
            current.board_id = newBoardId;
          });

          await listRepo.save(filteredLists);

          if (list.board_id !== newBoardId) {
            const sourceLists = await listRepo.find({
              where: { board_id: list.board_id, is_archived: false },
              order: { position: "ASC" },
            });

            sourceLists.forEach((current, index) => {
              current.position = (index + 1) * 100;
            });

            await listRepo.save(sourceLists);
          }

          return {
            sourceBoardId: list.board_id,
            targetBoardId: newBoardId,
          };
        },
      );

      return {
        boardIds:
          sourceBoardId === targetBoardId
            ? [sourceBoardId]
            : [sourceBoardId, targetBoardId],
        list: await listModel.getListById(id),
      };
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new InternalServerError("Failed to move list");
    }
  }

  async copyList(id: number, newName?: string): Promise<List> {
    try {
      const sourceList = await listModel.getListByIdWithRelations(id);
      if (!sourceList) {
        throw new NotFoundError("Source list not found", 404);
      }

      const boardId = sourceList.board_id;
      const count = await listModel.countListsByBoardId(boardId);

      const newList = await listModel.createList(
        boardId,
        newName || `${sourceList.name} (copy)`,
        sourceList.cover_url,
        count + 1,
      );

      if (sourceList.cards?.length) {
        for (const card of sourceList.cards) {
          await cardModel.copyCardToList(card, newList.id, card.position);
        }
      }

      const result = await listModel.getListById(newList.id);
      if (!result) {
        throw new InternalServerError("Failed to load copied list");
      }

      return result;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new InternalServerError("Failed to copy list");
    }
  }

  async reorderList(id: number, newIndex: number, boardVersion: number) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");

      const moved = await this.moveList(id, list.board_id, newIndex, {
        boardVersion,
      });
      const movedList = moved.list;
      if (!movedList) {
        throw new NotFoundError("List not found");
      }
      return await this.getListsByBoard(movedList.board_id);
    } catch (error) {
      if (error instanceof ErrorResponse)
        throw error;
      throw new InternalServerError("Failed to reorder list");
    }
  }

  private async bumpBoardVersion(
    manager: EntityManager,
    boardId: number,
    expectedVersion: number,
  ) {
    const updateResult = await manager
      .createQueryBuilder()
      .update(Board)
      .set({
        version: () => `"version" + 1`,
      })
      .where("id = :boardId AND version = :expectedVersion", {
        boardId,
        expectedVersion,
      })
      .execute();

    if (!updateResult.affected) {
      const board = await manager.getRepository(Board).findOne({
        where: { id: boardId },
      });

      if (!board) {
        throw new NotFoundError("Board not found");
      }

      throw new ConflictRequestError(
        "Board order changed by another user. Please refresh and try again.",
      );
    }
  }
}

export default new ListService();
