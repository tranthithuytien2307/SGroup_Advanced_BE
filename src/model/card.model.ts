import { EntityManager } from "typeorm";
import { Card } from "../entities/card.entity";
import { TemplateList } from "../entities/template-list.entity";
import { AppDataSource } from "../data-source";

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

  async createCardsFromTemplate(
    manager: EntityManager,
    listMap: Map<number, number>,
    templateLists: TemplateList[]
  ) {
    const Cardrepo = manager.getRepository(Card);

    for (const tplList of templateLists) {
      const newListId = listMap.get(tplList.id);
      if (!newListId) continue;

      for (const tplCard of tplList.cards || []) {
        const card = Cardrepo.create({
          list_id: newListId,
          title: tplCard.title,
          description: tplCard.description,
        } as Partial<Card>);

        await Cardrepo.save(card);
      }
    }
  }
}

export default new CardModel();
