import listModel from "../model/list.model";
import boardModel from "../model/board.model";
import cardModel from "../model/card.model";
import {
  BadRequestError,
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
      
      return await listModel.createList({
        board_id: boardId,
        name,
        cover_url: coverUrl,
        position: count + 1, // Add to end
      });
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
      if (data.is_archived !== undefined) {
        list.is_archived = data.is_archived;
        list.archived_at = data.is_archived ? new Date() : null;
      }

      return await listModel.updateList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to update list");
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
        // Case 1: To the top
        const first = lists[0];
        newPosition = first ? first.position / 2 : 100;
      } else if (newIndex >= lists.length) {
        // Case 3: To the end
        const last = lists[lists.length - 1];
        newPosition = last ? last.position + 100 : 100;
      } else {
        // Case 2: In the middle
        const prev = lists[newIndex - 1];
        const next = lists[newIndex];

        newPosition = (prev.position + next.position) / 2;
      }

      // Update list
      list.board_id = newBoardId;
      list.position = newPosition;

      return await listModel.updateList(list);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to move list");
    }
  }

  async copyList(id: number, targetBoardId: number, newName?: string) {
    try {
      const sourceList = await listModel.getListById(id);
      if (!sourceList) throw new NotFoundError("Source list not found");

      const targetBoard = await boardModel.getById(targetBoardId);
      if (!targetBoard) throw new NotFoundError("Target board not found");

      // Create new list
      const count = await listModel.countListsByBoardId(targetBoardId);
      const newList = await listModel.createList({
        board_id: targetBoardId,
        name: newName || sourceList.name,
        cover_url: sourceList.cover_url,
        position: count + 1,
      });

      // Copy cards
      if (sourceList.cards && sourceList.cards.length > 0) {
        for (const card of sourceList.cards) {
          await cardModel.createCard({
            list_id: newList.id,
            title: card.title,
            description: card.description,
            position: card.position,
          });
        }
      }

      return await listModel.getListById(newList.id);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to copy list");
    }
  }
}

export default new ListService();
