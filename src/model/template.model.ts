import { AppDataSource } from "../data-source";
import { BoardTemplate } from "../entities/board-template.entity";
import { TemplateList } from "../entities/template-list.entity";
import { TemplateCard } from "../entities/template-card.entity";
import { Board } from "../entities/board.entity";

class TemplateModel {
  private tplRepo = AppDataSource.getRepository(BoardTemplate);
  private listRepo = AppDataSource.getRepository(TemplateList);
  private cardRepo = AppDataSource.getRepository(TemplateCard);
  private boardRepo = AppDataSource.getRepository(Board);
  async findById(id: number) {
    return this.tplRepo.findOne({
      where: { id },
      relations: ["lists", "lists.cards"],
      order: { id: "ASC" },
    });
  }

  async create(data: Partial<BoardTemplate>) {
    const t = this.tplRepo.create(data);
    return this.tplRepo.save(t);
  }

  async createLists(lists: Partial<TemplateList>[]) {
    const items = this.listRepo.create(lists);
    return this.listRepo.save(items);
  }

  async createCards(cards: Partial<TemplateCard>[]) {
    const items = this.cardRepo.create(cards);
    return this.cardRepo.save(items);
  }

  async getAll() {
    return await this.tplRepo.find({
      order: { id: "DESC" },
    });
  }
}

export default new TemplateModel();
