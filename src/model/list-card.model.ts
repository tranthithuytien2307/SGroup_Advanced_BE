import { EntityManager } from "typeorm";
import { ListCard } from "../entities/list-card.entity";
import { TemplateList } from "../entities/template-list.entity";

class ListCardModel {
  async createListsFromTemplate(
    manager: EntityManager,
    boardId: number,
    templateLists: TemplateList[]
  ): Promise<Map<number, number>> {
    const listCardRepo = manager.getRepository(ListCard);
    const listMap = new Map<number, number>();

    for (const tl of templateLists) {
      const list = listCardRepo.create({
        board_id: boardId,
        name: tl.name,
        position: tl.position,
      } as Partial<ListCard>);

      const saved = await listCardRepo.save(list);
      listMap.set(tl.id, saved.id);
    }

    return listMap;
  }
}

export default new ListCardModel();
