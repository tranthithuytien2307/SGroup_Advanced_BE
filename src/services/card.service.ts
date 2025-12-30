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
import { AppDataSource } from "../data-source";
import { BoardMember } from "../entities/board-member.entity";
import { User } from "../entities/user.entity";
import { CardMember } from "../entities/card-member.entity";

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
      if (data.cover_color !== undefined) card.cover_color = data.cover_color;
      if (data.cover_image_url !== undefined) card.cover_image_url = data.cover_image_url;

      return await cardModel.updateCard(card);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to update card");
    }
  }

  async addMember(cardId: number, userId: number) {
    try {
      const card = await cardModel.getById(cardId);
      if (!card) throw new NotFoundError("Card not found");

      const list = await listModel.getListById(card.list_id);
      if (!list) throw new NotFoundError("List not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);
      const isMember = await boardMemberRepo.findOne({
        where: { board: { id: list.board_id }, user: { id: userId } },
      });

      if (!isMember) {
        throw new BadRequestError("User is not a member of the board");
      }

      const cardMemberRepo = AppDataSource.getRepository(CardMember);
      const existingMember = await cardMemberRepo.findOne({
        where: { card_id: cardId, user_id: userId },
      });

      if (existingMember) {
        throw new BadRequestError("User is already a member of this card");
      }

      const newMember = cardMemberRepo.create({
        card_id: cardId,
        user_id: userId,
      });
      await cardMemberRepo.save(newMember);

      return await cardModel.getCardDetails(cardId);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to add member to card");
    }
  }

  async removeMember(cardId: number, userId: number) {
    try {
      const cardMemberRepo = AppDataSource.getRepository(CardMember);
      const member = await cardMemberRepo.findOne({
        where: { card_id: cardId, user_id: userId },
      });

      if (!member) {
        throw new BadRequestError("User is not a member of this card");
      }

      await cardMemberRepo.remove(member);
      return await cardModel.getCardDetails(cardId);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to remove member from card");
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

  async setDates(
    card_id: number,
    start_date: Date | null,
    deadline_date: Date | null
  ) {
    try {
      const card = await cardModel.getById(card_id);
      if (!card) throw new NotFoundError("Card not found");

      return await cardModel.updateDates(card_id, start_date, deadline_date);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerError("Failed to set card dates");
    }
  }

  async markCompleted(card_id: number) {
    try {
      const card = await cardModel.getById(card_id);
      if (!card) throw new NotFoundError("Card not found");

      return await cardModel.markCompleted(card_id);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerError("Failed to complete card");
    }
  }

  async getDateStatus(card_id: number) {
    const card = await cardModel.getById(card_id);
    if (!card) throw new NotFoundError("Card not found");

    const now = new Date();

    return {
      is_completed: card.is_completed,
      is_overdue:
        !card.is_completed &&
        card.deadline_date !== null &&
        now > card.deadline_date,

      completed_early:
        card.is_completed &&
        card.deadline_date !== null &&
        now < card.deadline_date,
    };
  }
}

export default new CardService();
