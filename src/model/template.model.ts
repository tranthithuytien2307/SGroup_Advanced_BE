import { AppDataSource } from "../data-source";
import { TemplateBoard } from "../entities/template-board.entity";
import { TemplateList } from "../entities/template-list.entity";
import { TemplateCard } from "../entities/template-card.entity";
import { Board } from "../entities/board.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";
import { In } from "typeorm";

class TemplateModel {
  private templateBoardRepository = AppDataSource.getRepository(TemplateBoard);
  private templateListRepository = AppDataSource.getRepository(TemplateList);
  private templateCardRepository = AppDataSource.getRepository(TemplateCard);
  private workspaceMemberRepository = AppDataSource.getRepository(WorkspaceMember);
  async findById(id: number) {
    return this.templateBoardRepository.findOne({
      where: { id },
      relations: ["lists", "lists.cards"],
      order: { id: "ASC" },
    });
  }

  async create(data: Partial<TemplateBoard>) {
    const t = this.templateBoardRepository.create(data);
    return this.templateBoardRepository.save(t);
  }

  async createLists(lists: Partial<TemplateList>[]) {
    const items = this.templateListRepository.create(lists);
    return this.templateListRepository.save(items);
  }

  async createCards(cards: Partial<TemplateCard>[]) {
    const items = this.templateCardRepository.create(cards);
    return this.templateCardRepository.save(items);
  }

  async getAll() {
    return await this.templateBoardRepository.find({
      order: { id: "DESC" },
    });
  }

  async isUserMember(workspaceId: number, userId: number): Promise<boolean> {
    const member = await this.workspaceMemberRepository.findOne({
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
    const member = await this.workspaceMemberRepository.findOne({
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
