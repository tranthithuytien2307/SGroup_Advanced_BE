import { AppDataSource } from "../data-source";
import { Board } from "../entities/board.entity";
import { BoardMember } from "../entities/board-member.entity";
import { NotFoundError } from "../handler/error.response";

class BoardModel {
  private boardRepository = AppDataSource.getRepository(Board);
  private boardMemberRepository = AppDataSource.getRepository(BoardMember);

  async getAll(): Promise<Board[]> {
    return await this.boardRepository.find({
      relations: ["workspace"],
      order: { id: "ASC" },
    });
  }

  async getById(id: number): Promise<Board | null> {
    return await this.boardRepository.findOne({
      where: { id },
      relations: ["workspace"],
    });
  }

  async getBoardsByWorkspaceId(workspace_id: number): Promise<Board[]> {
    return await this.boardRepository.find({
      where: { workspace_id },
      order: { id: "ASC" },
    });
  }

  async createBoard(
    name: string,
    workspace_id: number,
    created_by_id: number,
    cover_url?: string,
    description?: string | null
  ): Promise<Board> {
    const newBoard = this.boardRepository.create({
      name,
      workspace_id,
      created_by_id,
      cover_url: cover_url || null,
      description: description || null,
    });

    const saved = await this.boardRepository.save(newBoard);

    const member = this.boardMemberRepository.create({
      board: { id: saved.id },
      user: { id: created_by_id },
      role: "admin",
    });
    await this.boardMemberRepository.save(member);
    
    return saved;
  }

  async updateBoard(
    id: number,
    name?: string,
    cover_url?: string,
    description?: string | null,
    theme?: string | null,
    is_archived?: boolean
  ): Promise<Board> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) throw new NotFoundError("Board not found");

    if (name !== undefined) board.name = name;
    if (cover_url !== undefined) board.cover_url = cover_url;
    if (description !== undefined) board.description = description;
    if (theme !== undefined) board.theme = theme;
    if (is_archived !== undefined) {
      board.is_archived = is_archived;
      board.archived_at = is_archived ? new Date() : null;
    }

    return await this.boardRepository.save(board);
  }

  async updateVisibility(
    id: number,
    visibility: "private" | "workspace" | "public"
  ): Promise<Board> {
    const board = await this.boardRepository.findOneBy({ id })
    if (!board) throw new NotFoundError("Board not found");

    board.visibility = visibility;
    return await this.boardRepository.save(board);
  }

  async deleteBoard(id: number): Promise<void> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) throw new NotFoundError("Board not found");
    await this.boardRepository.remove(board);
  }
}

export default new BoardModel();
