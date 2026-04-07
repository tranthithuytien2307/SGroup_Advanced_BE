import boardMemberModel from "../model/board-member.model";
import boardModel from "../model/board.model";
import {
  ErrorResponse,
  NotFoundError,
  InternalServerError,
} from "../handler/error.response";

class BoardMemberService {
  async getBoardMembers(boardId: number) {
    try {
      const board = await boardModel.getById(boardId);
      if (!board) throw new NotFoundError("Board not found");

      return await boardMemberModel.getByBoardId(boardId);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to get board members");
    }
  }
}

export default new BoardMemberService();
