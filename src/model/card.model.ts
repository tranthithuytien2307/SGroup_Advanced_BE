import { Card } from "../entities/card.entity";
import { AppDataSource } from "../data-source";

class CardModel {
  private cardRepository = AppDataSource.getRepository(Card);

  async createCard(listId: number, title: string, position: number): Promise<Card> {
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
      relations: ["list", "members", "members.user", "comments", "comments.user"],
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

  async countCardsByListId(listId: number): Promise<number> {
    return await this.cardRepository.count({ where: { list_id: listId, is_archived: false } });
  }

  async updateCard(card: Card): Promise<Card> {
    return await this.cardRepository.save(card);
  }

  async copyCardToList(card: Card, toListId: number, position: number): Promise<Card> {
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
    await this.cardRepository.save(cards);
  } 
}

export default new CardModel();