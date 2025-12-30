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
import boardModel from "../model/board.model";

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

  async archiveCard(id: number) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      card.is_archived = true;
      card.archived_at = new Date();

      return await cardModel.updateCard(card);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to archive card");
    }
  }

  async unarchiveCard(id: number) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      card.is_archived = false;
      card.archived_at = null;
      return await cardModel.updateCard(card);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to unarchive card");
    }
  }

  async reorderCard(id: number, newIndex: number) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      const listId = card.list_id;
      const cards = await cardModel.getCardsByListId(listId);

      const filteredCards = cards.filter((c) => c.id !== id);

      if (newIndex < 0 || newIndex > filteredCards.length) {
        throw new BadRequestError("Invalid new index");
      }

      let newPosition: number;
      if (filteredCards.length === 0) {
        newPosition = 100;
      } else if (newIndex === filteredCards.length) {
        newPosition = filteredCards[filteredCards.length - 1].position + 100;
      } else if (newIndex === 0) {
        newPosition = filteredCards[0].position / 2;
      } else {
        const prev = filteredCards[newIndex - 1];
        const next = filteredCards[newIndex];
        newPosition = (prev.position + next.position) / 2;
      }

      card.position = newPosition;
      await cardModel.updateCard(card);

      const needReindex = this.shouldReindex(filteredCards);
      if (needReindex) {
        await this.reindexList(listId);
      }

      return await cardModel.getCardsByListId(listId);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to reorder card");
    }
  }

    async moveCard(
    id: number,
    toBoardId: number,
    toListId: number,
    newIndex: number
  ) {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");

      const fromList = await listModel.getListById(card.list_id);
      if (!fromList) throw new NotFoundError("Source list not found");

      const toBoard = await boardModel.getById(toBoardId);
      if (!toBoard) throw new NotFoundError("Target board not found");

      const toList = await listModel.getListById(toListId);
      if (!toList) throw new NotFoundError("Target list not found");

      if (toList.board_id !== toBoardId) {
        throw new BadRequestError("Target list does not belong to target board");
      }

      const targetCards = await cardModel.getCardsByListId(toListId);

      if (newIndex < 0 || newIndex > targetCards.length) {
        throw new BadRequestError("Invalid new index");
      }

      card.list_id = toListId;
      card.list = { id: toListId } as List;
      card.position = this.computeNewPosition(targetCards, newIndex);

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


  async copyCard(
    id: number,
    toBoardId: number,
    toListId: number,
    newIndex: number,
    newTitle?: string
  ) {
    try {
      const sourceCard = await cardModel.getById(id);
      if (!sourceCard) throw new NotFoundError("Source card not found");

      const fromList = await listModel.getListById(sourceCard.list_id);
      if (!fromList) throw new NotFoundError("Source list not found");

      const toBoard = await boardModel.getById(toBoardId);
      if (!toBoard) throw new NotFoundError("Target board not found");

      const toList = await listModel.getListById(toListId);
      if (!toList) throw new NotFoundError("Target list not found");

      if (toList.board_id !== toBoardId) {
        throw new BadRequestError("Target list does not belong to target board");
      }

      const targetCards = await cardModel.getCardsByListId(toListId);

      if (newIndex < 0 || newIndex > targetCards.length) {
        throw new BadRequestError("Invalid new index");
      }

      const newPosition = this.computeNewPosition(targetCards, newIndex);

      const created = await cardModel.createCard(
        toListId,
        newTitle ?? `${sourceCard.title} (copy)`,
        newPosition
      );

      created.description = sourceCard.description;
      await cardModel.updateCard(created);

      if (this.shouldReindex(targetCards)) {
        await this.reindexList(toListId);
      }

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