import { AppDataSource } from "../data-source";
import { Card } from "../entities/card.entity";

class CardModel {
  private cardRepository = AppDataSource.getRepository(Card);

  async createCard(data: Partial<Card>): Promise<Card> {
    const newCard = this.cardRepository.create(data);
    return await this.cardRepository.save(newCard);
  }

  async getCardsByListId(listId: number): Promise<Card[]> {
    return await this.cardRepository.find({
      where: { list_id: listId },
      order: { position: "ASC" },
    });
  }
}

export default new CardModel();
