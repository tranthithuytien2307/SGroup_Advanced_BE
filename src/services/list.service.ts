import listModel from "../model/list.model";
import boardModel from "../model/board.model";
import cardModel from "../model/card.model";
import {
  BadRequestError,
  ErrorResponse,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";
import { List } from "../entities/list.entity";

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
        count + 1
      );
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to create list");
    }
  }

  async updateList(id: number, data: Partial<List>) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");

      if (data.name !== undefined) list.name = data.name;
      if (data.cover_url !== undefined) list.cover_url = data.cover_url;

      return await listModel.updateList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to update list");
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

  async moveList(id: number, newBoardId: number, newIndex: number) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");

      const targetBoard = await boardModel.getById(newBoardId);
      if (!targetBoard) throw new NotFoundError("Target board not found");

      let lists = await listModel.getListsByBoardId(newBoardId);

      lists = lists.filter((l) => l.id !== list.id);

      let newPosition: number;

      if (newIndex <= 0) {
        const first = lists[0];
        newPosition = first ? first.position / 2 : 100;
      } else if (newIndex >= lists.length) {
        const last = lists[lists.length - 1];
        newPosition = last ? last.position + 100 : 100;
      } else {
        const prev = lists[newIndex - 1];
        const next = lists[newIndex];

        newPosition = (prev.position + next.position) / 2;
      }

      list.board = targetBoard;
      list.board_id = newBoardId;
      list.position = newPosition;

      return await listModel.updateList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to move list");
    }
  }

  async copyList(id: number, newName?: string): Promise<List> {
    try {
      const sourceList = await listModel.getListById(id);
      if (!sourceList) {
        throw new NotFoundError("Source list not found", 404);
      }

      const boardId = sourceList.board_id;
      const count = await listModel.countListsByBoardId(boardId);

      const newList = await listModel.createList(
        boardId,
        newName || `${sourceList.name} (copy)`,
        sourceList.cover_url,
        count + 1
      );

      if (sourceList.cards?.length) {
        for (const card of sourceList.cards) {
          await cardModel.copyCardToList(
            newList.id,
            card.title,
            card.description,
            card.position
          );
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

  private shouldReindex(lists: List[]): boolean {
    for (let i = 1; i < lists.length; i++) {
      if (Math.abs(lists[i].position - lists[i - 1].position) < 0.0001) {
        return true;
      }
    }
    return false;
  }

  private async reindexBoard(boardId: number) {
    const lists = await listModel.getListsByBoardId(boardId);

    for (let i = 0; i < lists.length; i++) {
      lists[i].position = (i + 1) * 100;
    }

    await listModel.bulkUpdate(lists);
  }

  async reorderList(id: number, newIndex: number) {
    try {
      const list = await listModel.getListById(id);
      if (!list) throw new NotFoundError("List not found");

      const lists = await this.getListsByBoard(list.board_id)

      const filteredLists = lists.filter((l) => l.id !== id )

      if (newIndex < 0 || newIndex > filteredLists.length) {
        throw new BadRequestError("Invalid new index");
      }

      let newPosition: number;
      if (filteredLists.length === 0) newPosition = 100;
      else if (newIndex === filteredLists.length) {
        newPosition = filteredLists[filteredLists.length - 1].position + 100;
      }
      else if (newIndex === 0) {
        newPosition = filteredLists[0].position / 2;
      }
      else {
        const prev = filteredLists[newIndex - 1];
        const next = filteredLists[newIndex];
        newPosition = (prev.position + next.position) / 2;
      }

      list.position = newPosition;

      await listModel.updateList(list)

      const needReindex = this.shouldReindex(filteredLists);
      if (needReindex) {
        await this.reindexBoard(list.board_id);
      }

      return await this.getListsByBoard(list.board_id);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new InternalServerError("Failed to reorder list");
    }
  }
}

export default new ListService();
