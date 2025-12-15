import { EntityManager } from "typeorm";
import { Card } from "../entities/card.entity";
import { TemplateList } from "../entities/template-list.entity";

class CardModel {
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
