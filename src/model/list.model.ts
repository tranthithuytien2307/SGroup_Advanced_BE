import { AppDataSource } from "../data-source";
import { List } from "../entities/list.entity";

class ListModel {
  private listRepository = AppDataSource.getRepository(List);

  async createList(
    boardId: number,
    name: string,
    coverUrl: string | null,
    position: number,
  ): Promise<List> {
    const newList = this.listRepository.create({
      name,
      cover_url: coverUrl ?? undefined,
      position,
      board: { id: boardId },
    });

    return await this.listRepository.save(newList);
  }

  async getListById(id: number): Promise<List | null> {
    return await this.listRepository.findOne({
      where: { id },
      relations: ["board", "cards"],
    });
  }

  async getListsByBoardId(boardId: number): Promise<List[]> {
    return await this.listRepository
      .createQueryBuilder("list")
      .leftJoinAndSelect(
        "list.cards",
        "card",
        "card.is_archived = :isArchived",
        { isArchived: false },
      )
      .leftJoinAndSelect("card.checklists", "checklist")
      .where("list.board_id = :boardId", { boardId })
      .andWhere("list.is_archived = :listArchived", {
        listArchived: false,
      })
      .orderBy("list.position", "ASC")
      .addOrderBy("card.position", "ASC")
      .getMany();
  }

  async getArchivedListsByBoardId(boardId: number): Promise<List[]> {
    return await this.listRepository.find({
      where: { board_id: boardId, is_archived: true },
      order: { archived_at: "DESC" },
      relations: ["cards"],
    });
  }

  async updateList(list: List): Promise<List> {
    return await this.listRepository.save(list);
  }

  async deleteList(list: List): Promise<void> {
    await this.listRepository.remove(list);
  }

  async countListsByBoardId(boardId: number): Promise<number> {
    return await this.listRepository.count({
      where: { board_id: boardId },
    });
  }

  async bulkUpdate(lists: List[]): Promise<void> {
    await this.listRepository.save(lists);
  }

  async getListByIdWithRelations(id: number): Promise<List | null> {
    return this.listRepository.findOne({
      where: { id },
      relations: [
        "cards",
        "cards.labels",
        "cards.members",
        "cards.members.user",
        "cards.checklists",
        "cards.checklists.items",
      ],
    });
  }
}

export default new ListModel();
