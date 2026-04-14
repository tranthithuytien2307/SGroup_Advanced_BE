import boardModel from "../model/board.model";
import listModel from "../model/list.model";
import { io } from "../index";

class BoardRealtimeService {
  async getBoardState(boardId: number) {
    const [board, lists] = await Promise.all([
      boardModel.getById(boardId),
      listModel.getListsByBoardId(boardId),
    ]);

    if (!board) return null;

    return {
      boardId,
      boardVersion: board.version,
      lists,
    };
  }

  async emitBoardState(
    boardId: number,
    reason: "card_updated" | "card_reordered" | "list_updated" | "list_reordered",
  ) {
    const state = await this.getBoardState(boardId);
    if (!state) return null;

    io.to(`board-${boardId}`).emit("board:state-updated", {
      ...state,
      reason,
    });

    return state;
  }

  async emitManyBoardStates(
    boardIds: number[],
    reason: "card_reordered" | "list_reordered",
  ) {
    const uniqueBoardIds = [...new Set(boardIds)];
    await Promise.all(uniqueBoardIds.map((boardId) => this.emitBoardState(boardId, reason)));
  }
}

export default new BoardRealtimeService();
