import { Card } from "../entities/card.entity";
import { AppDataSource } from "../data-source";

class CardModel {
  private cardRepository = AppDataSource.getRepository(Card);

  async createCard(
    listId: number,
    title: string,
    position: number,
  ): Promise<Card> {
    const card = this.cardRepository.create({
      title,
      position,
      list: { id: listId },
      list_id: listId,
      description: null,
    });
    return await this.cardRepository.save(card);
  }

  async getById(id: number): Promise<Card | null> {
    return await this.cardRepository.findOne({
      where: { id },
      relations: ["list", "members", "members.user"],
    });
  }

  async getCardDetails(id: number): Promise<Card | null> {
    return await this.cardRepository.findOne({
      where: { id },
      relations: [
        "list",
        "members",
        "members.user",
        "comments",
        "comments.user",
      ],
      order: {
        comments: {
          created_at: "ASC",
        },
      },
    });
  }

  async getCardsByListId(listId: number): Promise<Card[]> {
    return await this.cardRepository.find({
      where: { list_id: listId, is_archived: false },
      relations: ["members", "members.user"],
      order: { position: "ASC" },
    });
  }

  async deleteCard(id: number): Promise<void> {
    await this.cardRepository.delete({ id });
  }

  async countCardsByListId(listId: number): Promise<number> {
    return await this.cardRepository.count({
      where: { list_id: listId, is_archived: false },
    });
  }

  async updateMoveCard(card: Card): Promise<void> {
    await this.cardRepository.update(card.id, {
      list_id: card.list_id,
      position: card.position,
    });
  }

  async updateCard(card: Card): Promise<void> {
    await this.cardRepository.update(card.id, {
      list_id: card.list_id,
      position: card.position,
      title: card.title,
      description: card.description,
      cover_color: card.cover_color,
      cover_image_url: card.cover_image_url,
    });
  }

  async copyCardToList(
    card: Card,
    toListId: number,
    position: number,
  ): Promise<Card> {
    const newCard = this.cardRepository.create({
      title: card.title,
      description: card.description,
      position,
      list: { id: toListId },
      list_id: toListId,
    });
    return await this.cardRepository.save(newCard);
  }

  async bulkUpdate(cards: Card[]): Promise<void> {
    const promises = cards.map((card) =>
      this.cardRepository.update(card.id, {
        position: card.position,
        list_id: card.list_id,
      }),
    );

    await Promise.all(promises);
  }

  async updateDates(
    card_id: number,
    start_date: Date | null,
    deadline_date: Date | null,
  ): Promise<Card> {
    await this.cardRepository.update(
      { id: card_id },
      { strat_date: start_date, deadline_date },
    );

    return (await this.getById(card_id))!;
  }
  async removeDeadline(card_id: number): Promise<Card> {
    await this.cardRepository.update(
      { id: card_id },
      {
        deadline_date: null,
        strat_date: null,
      },
    );

    return (await this.getById(card_id))!;
  }

  async markCompleted(card_id: number): Promise<Card> {
    await this.cardRepository.update({ id: card_id }, { is_completed: true });

    return (await this.getById(card_id))!;
  }
}

export default new CardModel();
