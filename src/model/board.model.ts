import { AppDataSource } from "../data-source";
import { Board } from "../entities/board.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
import { BoardInvitation } from "../entities/board_invitations.entity";
import { User } from "../entities/user.entity";
import { EntityManager } from "typeorm";
import { TemplateBoard } from "../entities/template-board.entity";
import { TemplateList } from "../entities/template-list.entity";
import { TemplateCard } from "../entities/template-card.entity";
import { List } from "../entities/list.entity";
import { Card } from "../entities/card.entity";

class BoardModel {
  private boardRepository = AppDataSource.getRepository(Board);
  private boardMemberRepository = AppDataSource.getRepository(BoardMember);
  private userRepository = AppDataSource.getRepository(User);
  private boardInvitationRepository =
    AppDataSource.getRepository(BoardInvitation);
  private templateBoardRepository = AppDataSource.getRepository(TemplateBoard);
  private templateListRepository = AppDataSource.getRepository(TemplateList);
  private templateCardRepository = AppDataSource.getRepository(TemplateCard);
  private listRepository = AppDataSource.getRepository(List);
  private cardRepository = AppDataSource.getRepository(Card);

  async getAll(): Promise<Board[]> {
    return await this.boardRepository.find({
      relations: ["workspace"],
      order: { id: "ASC" },
    });
  }

  async getById(id: number): Promise<(Board & { memberCount: number }) | null> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: [
        "workspace",
        "members",
        "members.user",
        "lists",
        "lists.cards",
      ],
    });

    if (!board) return null;

    const activeLists =
      board.lists
        ?.filter((l) => !l.is_archived)
        .map((l) => ({
          ...l,
          cards: l.cards?.filter((c) => !c.is_archived) || [],
        })) || [];

    return {
      ...board,
      lists: activeLists,
      memberCount: board.members?.length || 0,
    };
  }

  async getCreatedBy(boardId: number): Promise<User | null> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ["created_by"],
    });

    return board?.created_by || null;
  }

  async updateBoardBackground(
    boardId: number,
    data: { cover_url?: string; theme?: string },
  ): Promise<Board | null> {
    await this.boardRepository.update(boardId, data);
    return await this.getById(boardId);
  }

  async getBoardsByWorkspaceId(workspace_id: number) {
    const result = await this.boardRepository
      .createQueryBuilder("board")
      .leftJoin("board.members", "member")
      .leftJoin("board.lists", "list")
      .where("board.workspace_id = :workspace_id", { workspace_id })
      .andWhere("board.is_archived = :isArchived", { isArchived: false })
      .addSelect("COUNT(DISTINCT member.id)", "memberCount")
      .addSelect("COUNT(DISTINCT list.id)", "listCount")
      .groupBy("board.id")
      .orderBy("board.id", "ASC")
      .getRawAndEntities();

    return result.entities.map((board, index) => ({
      ...board,
      memberCount: Number(result.raw[index].memberCount),
      listCount: Number(result.raw[index].listCount),
    }));
  }

  async createBoard(
    name: string,
    workspace_id: number,
    created_by_id: number,
    cover_url?: string,
    description?: string | null,
    invite_token?: string,
    invite_enabled?: boolean,
  ): Promise<Board> {
    const newBoard = this.boardRepository.create({
      name,
      workspace_id,
      created_by_id,
      cover_url: cover_url || null,
      description: description || null,
      invite_token: invite_token || null,
      invite_enabled: invite_enabled || false,
    });
    return await this.boardRepository.save(newBoard);
  }

  async createBoardMember(
    boardId: number,
    userId: number,
    role: BoardRole = "admin",
  ): Promise<BoardMember> {
    const member = this.boardMemberRepository.create({
      board: { id: boardId } as Board,
      user: { id: userId } as User,
      role: "admin",
    });
    return await this.boardMemberRepository.save(member);
  }

  async updateBoard(board: Board): Promise<Board> {
    return await this.boardRepository.save(board);
  }

  async archiveBoard(board: Board): Promise<Board> {
    return await this.boardRepository.save(board);
  }

  async unarchiveBoard(board: Board): Promise<Board> {
    return await this.boardRepository.save(board);
  }

  async deleteBoard(board: Board): Promise<void> {
    await this.boardRepository.remove(board);
  }
  async isUserBoardMember(boardId: number, userId: number): Promise<boolean> {
    const member = await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        user: { id: userId },
      },
    });
    return !!member;
  }

  async findMemberByEmail(
    boardId: number,
    email: string,
  ): Promise<BoardMember | null> {
    return await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        user: { email: email },
      },
    });
  }

  async findInvitation(boardId: number, email: string) {
    return this.boardInvitationRepository.findOne({
      where: { board: { id: boardId }, email },
    });
  }

  async createInvitation(
    boardId: number,
    email: string,
    role: BoardRole,
    token: string,
    inviterId: number,
  ) {
    const invite = this.boardInvitationRepository.create({
      board: { id: boardId },
      email,
      role,
      token,
      inviter_id: inviterId,
      status: "pending",
    });

    return await this.boardInvitationRepository.save(invite);
  }

  async changeOwnerBoard(
    boardId: number,
    newOwnerId: number,
  ): Promise<BoardMember> {
    const board = await this.boardRepository.findOneBy({ id: boardId });
    if (!board) throw new Error("Board not found");

    const newOwnerMember = await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        user: { id: newOwnerId },
      },
    });

    if (!newOwnerMember) {
      throw new Error("New owner must be a board member");
    }

    newOwnerMember.role = "admin";
    return await this.boardMemberRepository.save(newOwnerMember);
  }

  async regenerateInviteLink(id: number, invite_token: string): Promise<Board> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) throw new Error("Board not found");

    board.invite_token = invite_token;
    board.invite_enabled = true;
    return await this.boardRepository.save(board);
  }

  async disableInviteLink(id: number, disabledInvite: boolean): Promise<Board> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) throw new Error("Board not found");

    board.invite_enabled = disabledInvite;
    return await this.boardRepository.save(board);
  }

  async getBoardByInviteToken(invite_token: string): Promise<Board | null> {
    return this.boardRepository.findOneBy({ invite_token });
  }

  async createInvitionUser(
    boardId: number,
    userId: number,
  ): Promise<BoardMember> {
    const newMember = this.boardMemberRepository.create({
      board: { id: boardId } as any,
      user: { id: userId } as any,
      role: "member",
    });

    return await this.boardMemberRepository.save(newMember);
  }

  async createUser(email: string, name?: string): Promise<User> {
    try {
      const user = this.userRepository.create({
        email,
        name: name || email.split("@")[0],
        password: null,
      });
      return await this.userRepository.save(user);
    } catch (error) {
      console.error("Error in cteateUser: ", error);
      throw new Error("Failed to create user");
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      console.error("Error in findUserByEmail:", error);
      throw new Error("Failed to find user by email");
    }
  }

  async findInvitationByToken(token: string): Promise<BoardInvitation | null> {
    try {
      return await this.boardInvitationRepository.findOne({
        where: { token },
        relations: ["board"],
      });
    } catch (error) {
      console.error("Error in findByToken: ", error);
      throw new Error("Failed to find by token");
    }
  }

  async updateInvitationStatus(
    invitation: BoardInvitation,
    status: "pending" | "accepted" | "expired",
  ): Promise<BoardInvitation> {
    try {
      invitation.status = status;
      return await this.boardInvitationRepository.save(invitation);
    } catch (error) {
      console.error("Error in updateStatus: ", error);
      throw new Error("Failed to update status");
    }
  }

  async findExistingInvitation(
    boardId: number,
    email: string,
  ): Promise<BoardInvitation | null> {
    try {
      return await this.boardInvitationRepository.findOne({
        where: { board: { id: boardId }, email },
      });
    } catch (error) {
      console.error("Error in findExistingInvatation: ", error);
      throw new Error("Failed to find exit invitation");
    }
  }

  async createMember(
    board: Board,
    user: User,
    role: "admin" | "member" | "viewer" = "member",
  ): Promise<BoardMember> {
    try {
      const newMember = this.boardMemberRepository.create({
        board,
        user,
        role,
      });
      return await this.boardMemberRepository.save(newMember);
    } catch (error) {
      console.error("Error in createMember:", error);
      throw new Error("Failed to create workspace member");
    }
  }

  async createBoardFromTemplate(
    manager: EntityManager,
    name: string,
    workspaceId: number,
    ownerId: number,
    visibility: "private" | "workspace" | "public",
  ): Promise<Board> {
    const repo = manager.getRepository(Board);

    const board = repo.create({
      name: name,
      workspace_id: workspaceId,
      created_by_id: ownerId,
      visibility: visibility,
    } as Partial<Board>);

    return await repo.save(board);
  }

  async saveBoardAsTemplate(boardId: number) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ["lists", "lists.cards"],
    });

    if (!board || !board.created_by_id) {
      throw new Error("Board not found or has no creator");
    }

    const owner = await this.userRepository.findOne({
      where: { id: board.created_by_id },
    });

    if (!owner) throw new Error("Owner not found");

    const template = this.templateBoardRepository.create({
      name: board.name,
      created_by_id: board.created_by_id,
      owner: owner,
      description: board.description ?? null,
      cover_url: board.cover_url ?? null,
      theme: board.theme ?? null,
    });

    const savedTemplate = await this.templateBoardRepository.save(template);

    const templateLists = board.lists.map((list) =>
      this.templateListRepository.create({
        template_id: savedTemplate.id,
        name: list.name,
        position: list.position,
      }),
    );

    const createdTemplateLists =
      await this.templateListRepository.save(templateLists);

    const listMap = new Map<number, number>();
    createdTemplateLists.forEach((tplList, index) => {
      listMap.set(board.lists[index].id, tplList.id);
    });

    const cardsToCreate = [];

    for (const list of board.lists) {
      const newTplListId = listMap.get(list.id);
      if (!newTplListId) continue;

      if (list.cards?.length) {
        for (const card of list.cards) {
          cardsToCreate.push(
            this.templateCardRepository.create({
              list_id: newTplListId,
              title: card.title,
              description: card.description ?? null,
            }),
          );
        }
      }
    }

    if (cardsToCreate.length > 0) {
      await this.templateCardRepository.save(cardsToCreate);
    }

    return savedTemplate;
  }
  async getArchived(boardId: number): Promise<{
    lists: List[];
    cards: Card[];
  }> {
    const archivedLists = await this.listRepository.find({
      where: {
        board_id: boardId,
        is_archived: true,
      },
    });

    const archivedCards = await this.cardRepository
      .createQueryBuilder("card")
      .leftJoinAndSelect("card.list", "list")
      .where("list.board_id = :boardId", { boardId })
      .andWhere("card.is_archived = true")
      .getMany();

    return {
      lists: archivedLists,
      cards: archivedCards,
    };
  }

  async getBoardsByUserId(userId: number) {
    const result = await this.boardRepository
      .createQueryBuilder("board")

      .leftJoin("board.members", "member")

      .leftJoin("board.lists", "list")

      .where("member.user_id = :userId", { userId })
      .orWhere("board.created_by_id = :userId", { userId })

      .addSelect("COUNT(DISTINCT member.id)", "memberCount")
      .addSelect("COUNT(DISTINCT list.id)", "listCount")

      .groupBy("board.id")

      .orderBy("board.created_at", "DESC")

      .getRawAndEntities();

    return result.entities.map((board, index) => ({
      ...board,
      memberCount: Number(result.raw[index].memberCount),
      listCount: Number(result.raw[index].listCount),
    }));
  }
}

export default new BoardModel();
