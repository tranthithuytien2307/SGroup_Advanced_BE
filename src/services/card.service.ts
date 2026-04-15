import cardModel from "../model/card.model";
import listModel from "../model/list.model";
import {
  BadRequestError,
  ConflictRequestError,
  ErrorResponse,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";
import { Card } from "../entities/card.entity";
import { List } from "../entities/list.entity";
import { Board } from "../entities/board.entity";
import boardModel from "../model/board.model";
import { AppDataSource } from "../data-source";
import { BoardMember } from "../entities/board-member.entity";
import { User } from "../entities/user.entity";
import { CardMember } from "../entities/card-member.entity";
import { EntityManager } from "typeorm";

class CardService {
  async createCard(listId: number, title: string) {
    try {
      const list = await listModel.getListById(listId);
      if (!list) throw new NotFoundError("List not found");

      const count = await cardModel.countCardsByListId(listId);
      const position = (count + 1) * 100;

      const createdCard = await cardModel.createCard(listId, title, position);
      return await cardModel.getById(createdCard.id);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to create card");
    }
  }

  async updateCard(
    id: number,
    data: Partial<Card> & { version: number },
  ) {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.cover_color !== undefined) updateData.cover_color = data.cover_color;
      if (data.cover_image_url !== undefined) {
        updateData.cover_image_url = data.cover_image_url;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestError("No card fields to update");
      }

      const result = await AppDataSource.getRepository(Card)
        .createQueryBuilder()
        .update(Card)
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
        const exists = await cardModel.getById(id);
        if (!exists) throw new NotFoundError("Card not found");
        throw new ConflictRequestError(
          "Card was updated by another user. Please refresh and try again.",
        );
      }

      return await cardModel.getById(id);
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

      const updatedCard = await cardModel.getById(cardId);
      return updatedCard?.members;
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

      const updatedCard = await cardModel.getById(cardId);
      return updatedCard?.members;
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

  async reorderCard(id: number, newIndex: number, boardVersion: number) {
    try {
      const moved = await this.moveCard(id, undefined, undefined, newIndex, {
        boardVersion,
      });
      return moved.cards;
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to reorder card");
    }
  }

  async moveCard(
    id: number,
    toBoardId: number | undefined,
    toListId: number | undefined,
    newIndex: number,
    versions: { boardVersion: number; targetBoardVersion?: number },
  ) {
    try {
      const { sourceBoardId, targetBoardId, targetListId } =
        await AppDataSource.transaction(
        async (manager) => {
          const cardRepo = manager.getRepository(Card);
          const listRepo = manager.getRepository(List);

          const card = await cardRepo.findOne({ where: { id } });
          if (!card) throw new NotFoundError("Card not found");

          const fromList = await listRepo.findOne({ where: { id: card.list_id } });
          if (!fromList) throw new NotFoundError("Source list not found");

          const destinationListId = toListId ?? fromList.id;
          const targetList = await listRepo.findOne({
            where: { id: destinationListId },
          });
          if (!targetList) throw new NotFoundError("Target list not found");

          const resolvedTargetBoardId = toBoardId ?? targetList.board_id;
          if (targetList.board_id !== resolvedTargetBoardId) {
            throw new BadRequestError("Target list does not belong to target board");
          }

          await this.bumpBoardVersion(manager, fromList.board_id, versions.boardVersion);

          if (
            resolvedTargetBoardId !== fromList.board_id &&
            versions.targetBoardVersion === undefined
          ) {
            throw new BadRequestError("Target board version is required");
          }

          if (resolvedTargetBoardId !== fromList.board_id) {
            await this.bumpBoardVersion(
              manager,
              resolvedTargetBoardId,
              versions.targetBoardVersion!,
            );
          }

          const fromCards = await cardRepo.find({
            where: { list_id: fromList.id, is_archived: false },
            order: { position: "ASC" },
          });

          const toCards =
            fromList.id === targetList.id
              ? [...fromCards]
              : await cardRepo.find({
                  where: { list_id: targetList.id, is_archived: false },
                  order: { position: "ASC" },
                });

          const sourceWithoutCard = fromCards.filter((current) => current.id !== id);

          if (newIndex < 0) {
            throw new BadRequestError("Invalid new index");
          }

          if (fromList.id === targetList.id) {
            if (newIndex > sourceWithoutCard.length) {
              throw new BadRequestError("Invalid new index");
            }

            sourceWithoutCard.splice(newIndex, 0, card);
            sourceWithoutCard.forEach((current, index) => {
              current.position = (index + 1) * 100;
              current.list_id = fromList.id;
            });

            await cardRepo.save(sourceWithoutCard);
          } else {
            if (newIndex > toCards.length) {
              throw new BadRequestError("Invalid new index");
            }

            const targetWithCard = [...toCards];
            card.list_id = targetList.id;
            targetWithCard.splice(newIndex, 0, card);

            sourceWithoutCard.forEach((current, index) => {
              current.position = (index + 1) * 100;
            });
            targetWithCard.forEach((current, index) => {
              current.position = (index + 1) * 100;
              current.list_id = targetList.id;
            });

            await cardRepo.save(sourceWithoutCard);
            await cardRepo.save(targetWithCard);
          }

          return {
            sourceBoardId: fromList.board_id,
            targetBoardId: resolvedTargetBoardId,
            targetListId: targetList.id,
          };
        },
      );

      return {
        boardIds:
          sourceBoardId === targetBoardId
            ? [sourceBoardId]
            : [sourceBoardId, targetBoardId],
        cards: await cardModel.getCardsByListId(targetListId),
      };
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
    newTitle?: string,
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
        throw new BadRequestError(
          "Target list does not belong to target board",
        );
      }

      const targetCards = await cardModel.getCardsByListId(toListId);

      if (newIndex < 0 || newIndex > targetCards.length) {
        throw new BadRequestError("Invalid new index");
      }

      const newPosition = this.computeNewPosition(targetCards, newIndex);

      const created = await cardModel.createCard(
        toListId,
        newTitle ?? `${sourceCard.title} (copy)`,
        newPosition,
      );

      created.description = sourceCard.description;
      await cardModel.updateCard(created);

      if (this.shouldReindex(targetCards)) {
        await this.reindexList(toListId, id, newIndex);
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

  async deleteCard(id: number): Promise<void> {
    try {
      const card = await cardModel.getById(id);
      if (!card) throw new NotFoundError("Card not found");
      await cardModel.deleteCard(id);
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      throw new InternalServerError("Failed to delete card");
    }
  }

  private async reindexList(
    listId: number,
    movedCardId?: number,
    newIndex?: number,
  ) {
    let cards = await cardModel.getCardsByListId(listId);

    if (movedCardId !== undefined && newIndex !== undefined) {
      const oldIndex = cards.findIndex((c) => c.id === movedCardId);

      if (oldIndex !== -1) {
        const [movedCard] = cards.splice(oldIndex, 1);
        cards.splice(newIndex, 0, movedCard);
      }
    }

    for (let i = 0; i < cards.length; i++) {
      cards[i].position = (i + 1) * 100;
    }

    await cardModel.bulkUpdate(cards);
  }

  async setDates(
    card_id: number,
    start_date: Date | null,
    deadline_date: Date | null,
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

  async removeDeadline(card_id: number) {
    try {
      const card = await cardModel.getById(card_id);
      if (!card) throw new NotFoundError("Card not found");

      return await cardModel.removeDeadline(card_id);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerError("Failed to remove deadline");
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

  async getCardMembers(cardId: number) {
    try {
      const card = await cardModel.getById(cardId);

      if (!card) throw new NotFoundError("Card not found");

      return card.members.map((m) => m.user).filter((u): u is User => !!u);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to get card members");
    }
  }
}

export default new CardService();
