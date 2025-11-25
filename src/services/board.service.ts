import boardModel from "../model/board.model";
import { Board } from "../entities/board.entity";
import { InternalServerError, ErrorResponse } from "../handler/error.response";
class BoardService {
  async getAll(): Promise<Board[]> {
    try {
      return await boardModel.getAll();
    } catch (error) {
      throw new InternalServerError("Failed to fetch boards");
    }
  }

  async getById(id: number): Promise<Board> {
    try {
      const board = await boardModel.getById(id);
      if (!board) {
        throw new ErrorResponse("Board not found", 404);
      }
      return board;
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to fetch board");
    }
  }

  async getBoardsByWorkspaceId(workspace_id: number): Promise<Board[]> {
    try {
      const boards = await boardModel.getBoardsByWorkspaceId(workspace_id);
      if (!boards || boards.length === 0) {
        throw new ErrorResponse("No boards found for this workspace", 404);
      }
      return boards;
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to fetch boards");
    }
  }

  async createBoard(
    name: string,
    workspace_id: number,
    created_by_id: number,
    cover_url?: string,
    description?: string | null
  ): Promise<Board> {
    try {
      return await boardModel.createBoard(
        name,
        workspace_id,
        created_by_id,
        cover_url,
        description
      );
    } catch (error) {
      throw new InternalServerError("Failed to create board");
    }
  }

  async updateBoard(
    id: number,
    name?: string,
    cover_url?: string,
    description?: string | null,
    theme?: string | null,
    visibility?: "private" | "workspace" | "public",
    is_archived?: boolean
  ): Promise<Board> {
    try {
      return await boardModel.updateBoard(
        id,
        name,
        cover_url,
        description,
        theme,
        visibility,
        is_archived
      );
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      if (error instanceof Error && error.message === "Board not found") {
        throw new ErrorResponse(error.message, 404);
      }
      throw new InternalServerError("Failed to update board");
    }
  }

  async deleteBoard(id: number): Promise<void> {
    try {
      await boardModel.deleteBoard(id);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      if (error instanceof Error && error.message === "Board not found") {
        throw new ErrorResponse(error.message, 404);
      }
      throw new InternalServerError("Failed to delete board");
    }
  }
}

export default new BoardService();
