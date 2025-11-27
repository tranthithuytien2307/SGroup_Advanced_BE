import boardModel from "../model/board.model";
import { Board } from "../entities/board.entity";
import { InternalServerError, NotFoundError } from "../handler/error.response";

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
        throw new NotFoundError("Board not found");
      }
      return board;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to fetch board");
    }
  }

  async getBoardsByWorkspaceId(workspace_id: number): Promise<Board[]> {
    try {
      const boards = await boardModel.getBoardsByWorkspaceId(workspace_id);
      if (!boards || boards.length === 0) {
        throw new NotFoundError("No boards found for this workspace");
      }
      return boards;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
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
      // Create the board
      const board = await boardModel.createBoard(
        name,
        workspace_id,
        created_by_id,
        cover_url,
        description
      );

      // Add creator as admin member of the board
      await boardModel.createBoardMember(board.id, created_by_id, "admin");

      return board;
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
    is_archived?: boolean
  ): Promise<Board> {
    try {
      // Validate board exists
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found");
      }

      // Apply updates
      if (name !== undefined) board.name = name;
      if (cover_url !== undefined) board.cover_url = cover_url;
      if (description !== undefined) board.description = description;
      if (theme !== undefined) board.theme = theme;

      return await boardModel.updateBoard(board);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to update board");
    }
  }

  async updateVisibility(
    id: number,
    visibility: "private" | "workspace" | "public"
  ): Promise<Board> {
    try {
      // Validate board exists
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found");
      }

      // Update visibility
      board.visibility = visibility;
      return await boardModel.updateBoard(board);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to update board visibility");
    }
  }

  async deleteBoard(id: number): Promise<void> {
    try {
      // Validate board exists
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found");
      }

      await boardModel.deleteBoard(board);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to delete board");
    }
  }

  async archiveBoard(id: number): Promise<Board> {
    try {
      // Validate board exists
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found");
      }

      // Set archive state
      board.is_archived = true;
      board.archived_at = new Date();

      return await boardModel.archiveBoard(board);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to archive board");
    }
  }

  async unarchiveBoard(id: number): Promise<Board> {
    try {
      // Validate board exists
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found");
      }

      // Remove archive state
      board.is_archived = false;
      board.archived_at = null;

      return await boardModel.unarchiveBoard(board);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to unarchive board");
    }
  }
}

export default new BoardService();
