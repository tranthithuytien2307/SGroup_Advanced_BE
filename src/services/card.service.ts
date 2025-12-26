import cardModel from "../model/card.model";
import listModel from "../model/list.model";
import {
  BadRequestError,
  ErrorResponse,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";
import { Card } from "../entities/card.entity";
import { List } from "../entities/list.entity";

class CardService {
async createCard(listId: number, title: string) {
    try {
      const list = await listModel.getListById(listId);
      if (!list) throw new NotFoundError("List not found");

      const count = await cardModel.countCardsByListId(listId);
      const position = (count + 1) * 100;

      return await cardModel.createCard(listId, title, position);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to create card");
    }
  }

  async updateCard(id: number, data: Partial<Card>) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      if (data.title !== undefined) card.title = data.title;
      if (data.description !== undefined) card.description = data.description;

      return await cardModel.updateCard(card);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to update card");
    }
  }

  async setArchive(id: number, isArchived: boolean) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      card.is_archived = isArchived;
      card.archived_at = isArchived ? new Date() : null;

      return await cardModel.updateCard(card);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to archive card");
    }
  }

  async reorderCard(id: number, newIndex: number) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      const listId = card.list_id;
      const cards = await cardModel.getCardsByListId(listId);
      const filtered = cards.filter((c) => c.id !== id);

      if (newIndex < 0 || newIndex > filtered.length) {
        throw new BadRequestError("Invalid new index");
      }

      const newPos = this.computeNewPosition(filtered, newIndex);
      card.position = newPos;
      await cardModel.updateCard(card);

      if (this.shouldReindex(filtered)) {
        await this.reindexList(listId);
      }

      return await cardModel.getCardsByListId(listId);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to reorder card");
    }
  }

  async moveCard(id: number, toListId: number, newIndex: number) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      const fromList = await listModel.getListById(card.list_id);
      if (!fromList) throw new NotFoundError("Source list not found");

      const toList = await listModel.getListById(toListId);
      if (!toList) throw new NotFoundError("Target list not found");

      if (fromList.board_id !== toList.board_id) {
        throw new BadRequestError("Cannot move card across different boards");
      }

      const targetCards = await cardModel.getCardsByListId(toListId);
      if (newIndex < 0 || newIndex > targetCards.length) {
        throw new BadRequestError("Invalid new index");
      }

      const newPos = this.computeNewPosition(targetCards, newIndex);

      card.list_id = toListId;
      card.list = { id: toListId } as List;
      card.position = newPos;

      await cardModel.updateCard(card);

      if (this.shouldReindex(targetCards)) {
        await this.reindexList(toListId);
      }

      return await cardModel.getCardsByListId(toListId);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to move card");
    }
  }

  async copyCard(id: number, toListId: number, newTitle?: string) {
    try {
      const source = await cardModel.getById(id);
      if (!source) throw new NotFoundError("Source card not found");

      const toList = await listModel.getListById(toListId);
      if (!toList) throw new NotFoundError("Target list not found");

      const fromList = await listModel.getListById(source.list_id);
      if (!fromList) throw new NotFoundError("Source list not found");

      if (fromList.board_id !== toList.board_id) {
        throw new BadRequestError("Cannot copy card across different boards (current rule)");
      }

      const count = await cardModel.countCardsByListId(toListId);
      const position = (count + 1) * 100;

      const created = await cardModel.createCard(
        toListId,
        newTitle ?? `${source.title} (copy)`,
        position
      );

      created.description = source.description;
      await cardModel.updateCard(created);

      return created;
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to copy card");
    }
  }

  private computeNewPosition(sortedCards: Card[], newIndex: number): number {
    if (sortedCards.length === 0) return 100;

    if (newIndex === 0) {
      return sortedCards[0].position / 2;
    }
    if (newIndex === sortedCards.length) {
      return sortedCards[sortedCards.length - 1].position + 100;
    }
    const prev = sortedCards[newIndex - 1];
    const next = sortedCards[newIndex];
    return (prev.position + next.position) / 2;
  }

  private shouldReindex(cards: Card[]): boolean {
    for (let i = 1; i < cards.length; i++) {
      if (Math.abs(cards[i].position - cards[i - 1].position) < 0.0001) {
        return true;
      }
    }
    return false;
  }

  private async reindexList(listId: number) {
    const cards = await cardModel.getCardsByListId(listId);
    for (let i = 0; i < cards.length; i++) {
      cards[i].position = (i + 1) * 100;
    }
    await cardModel.bulkUpdate(cards);
  }

}

export default new CardService();