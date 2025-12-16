import { AppDataSource } from "../data-source";
import { List } from "../entities/list.entity";

class ListModel {
  private listRepository = AppDataSource.getRepository(List);

  async createList(data: Partial<List>): Promise<List> {
    const newList = this.listRepository.create(data);
    return await this.listRepository.save(newList);
  }

  async getListById(id: number): Promise<List | null> {
    return await this.listRepository.findOne({
      where: { id },
      relations: ["board", "cards"],
    });
  }

  async getListsByBoardId(boardId: number): Promise<List[]> {
    return await this.listRepository.find({
      where: { board_id: boardId, is_archived: false },
      order: { position: "ASC" },
      relations: ["cards"],
    });
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
    return await this.listRepository.count({ where: { board_id: boardId } });
  }
}

export default new ListModel();
