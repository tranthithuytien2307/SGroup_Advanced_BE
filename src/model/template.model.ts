import { AppDataSource } from "../data-source";
import { Template } from "../entities/template.entity";
import { TemplateList } from "../entities/template-list.entity";
import { TemplateCard } from "../entities/template-card.entity";
import { Board } from "../entities/board.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";
import { In } from "typeorm";

class TemplateModel {
  private tplRepo = AppDataSource.getRepository(Template);
  private listRepo = AppDataSource.getRepository(TemplateList);
  private cardRepo = AppDataSource.getRepository(TemplateCard);
  private workspaceMemberRepo = AppDataSource.getRepository(WorkspaceMember);

  async findById(id: number) {
    return this.tplRepo.findOne({
      where: { id },
      relations: ["lists", "lists.cards"],
      order: { id: "ASC" },
    });
  }

  async create(data: Partial<Template>) {
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

  async isUserMember(workspaceId: number, userId: number): Promise<boolean> {
    const member = await this.workspaceMemberRepo.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
    });
    return !!member;
  }

  async isUserAdminOrOwner(
    workspaceId: number,
    userId: number
  ): Promise<boolean> {
    const member = await this.workspaceMemberRepo.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
        role: In(["owner", "admin"]),
      },
    });
    return !!member;
  }
}

export default new TemplateModel();
