import { AppDataSource } from "../data-source";
import { Checklist } from "../entities/checklist.entity";
import { ChecklistItem } from "../entities/checklist-item.entity";
import { EntityManager } from "typeorm";
import { NotFoundError } from "../handler/error.response";

class ChecklistModel {
  private checklistRepository = AppDataSource.getRepository(Checklist);
  private checklistItemRepository = AppDataSource.getRepository(ChecklistItem);

  async createChecklist(card_id: number, title: string): Promise<Checklist> {
    const checklist = this.checklistRepository.create({
      card_id,
      title,
    });
    return await this.checklistRepository.save(checklist);
  }

  async deleteChecklist(checklist_id: number): Promise<void> {
    await this.checklistRepository.delete({ id: checklist_id });
  }

  async addItemToChecklist(
    checklist_id: number,
    content: string
  ): Promise<ChecklistItem> {
    const item = this.checklistItemRepository.create({
      checklist_id,
      content,
      is_completed: false,
    });

    return await this.checklistItemRepository.save(item);
  }

  async updateItem(item_id: number, content: string): Promise<ChecklistItem> {
    await this.checklistItemRepository.update({ id: item_id }, { content });

    const item = await this.checklistItemRepository.findOne({
      where: { id: item_id },
    });

    if (!item) {
      throw new NotFoundError("Checklist item not found");
    }

    return item;
  }

  async toggleItem(
    item_id: number,
    is_completed: boolean
  ): Promise<ChecklistItem> {
    await this.checklistItemRepository.update(
      { id: item_id },
      { is_completed }
    );
    const item = await this.checklistItemRepository.findOne({
      where: { id: item_id },
    });

    if (!item) {
      throw new NotFoundError("Checklist item not found");
    }

    return item;
  }

  async deleteItem(item_id: number): Promise<void> {
    await this.checklistItemRepository.delete({ id: item_id });
  }

  async getProgress(checklist_id: number): Promise<number> {
    const total = await this.checklistItemRepository.count({
      where: { checklist_id },
    });
    if (total === 0) return 0;

    const completed = await this.checklistItemRepository.count({
      where: { checklist_id, is_completed: true },
    });

    return Math.round((completed / total) * 100);
  }
}

export default new ChecklistModel();
