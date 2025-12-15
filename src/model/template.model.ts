import { AppDataSource } from "../data-source";
import { Template } from "../entities/template.entity";

class TemplateModel {
  private templateRepository = AppDataSource.getRepository(Template);

  async findByIdWithLists(templateId: number): Promise<Template | null> {
    return this.templateRepository.findOne({
      where: { id: templateId },
      relations: ["lists", "lists.cards"],
      order: {
        lists: { position: "ASC" },
      },
    });
  }

  async getActiveTemplates(): Promise<Template[]> {
    return this.templateRepository.find({
      where: { is_archived: false },
      relations: ["lists", "lists.cards"],
      order: {
        created_at: "DESC",
        lists: { position: "ASC" },
      },
    });
  }
}

export default new TemplateModel();
