import { AppDataSource } from "../data-source";
import { BoardMember } from "../entities/board-member.entity";

class BoardMemberModel {
  private boardMemberRepository = AppDataSource.getRepository(BoardMember);

  async getByBoardId(boardId: number): Promise<BoardMember[]> {
    return await this.boardMemberRepository.find({
      where: {
        board: { id: boardId },
      },
      relations: ["user"],
      order: {
        id: "ASC",
      },
    });
  }
}

export default new BoardMemberModel();
