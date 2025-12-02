import boardModel from "../model/board.model";
import { Board } from "../entities/board.entity";
import { randomUUID } from "crypto";
import mailService from "./mail.service";
import {
  AuthFailureError,
  BadRequestError,
  NotFoundError,
} from "../handler/error.response";
import { BoardInvitation } from "../entities/board_invitations.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
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
        throw new NotFoundError("Board not found", 404);
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
        throw new NotFoundError("No boards found for this workspace", 404);
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
      const board = await boardModel.createBoard(
        name,
        workspace_id,
        created_by_id,
        cover_url,
        description,
        randomUUID(),
        true
      );
      await boardModel.saveAdminToBoard(board.id, created_by_id);
      return board;
    } catch (error) {
      throw new InternalServerError("Failed to create board");
    }
  }

  async updateBoard(
    id: number,
    name: string,
    cover_url?: string,
    description?: string
  ): Promise<Board> {
    try {
      return await boardModel.updateBoard(id, name, cover_url, description);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      if (error instanceof Error && error.message === "Board not found") {
        throw new NotFoundError(error.message, 404);
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
        throw new NotFoundError(error.message, 404);
      }
      throw new InternalServerError("Failed to delete board");
    }
  }

  async changeOwner(boardId: number, newOwnerId: number): Promise<BoardMember> {
    try {
      const board = await boardModel.getById(boardId);
      if (!board) {
        throw new NotFoundError("Board not found", 404);
      }

      if (!board.created_by_id) {
        throw new NotFoundError("Board has no owner", 400);
      }

      if (board.created_by_id === newOwnerId) {
        throw new BadRequestError(
          "New owner must be different from current owner",
          400
        );
      }

      const isMember = await boardModel.isUserBoardMember(boardId, newOwnerId);
      if (!isMember) {
        throw new BadRequestError("New owner must be a board member", 400);
      }

      return await boardModel.changeOwnerBoard(boardId, newOwnerId);
    } catch (error: any) {
      if (error instanceof ErrorResponse) throw error;
      throw new InternalServerError("Failed to change board owner");
    }
  }

  async inviteLink(
    id: number
  ): Promise<{ inviteUrl: string; invite_enabled: boolean }> {
    try {
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found", 404);
      }
      if (!board.invite_enabled) {
        throw new BadRequestError(
          "Invites are not enabled for this board",
          400
        );
      } else {
        return {
          inviteUrl: `http://localhost:3000/api/board/invite/${board.invite_token}`,
          invite_enabled: board.invite_enabled,
        };
      }
    } catch (error) {
      throw new InternalServerError("Failed to get invite link");
    }
  }

  async regenerateInviteLink(id: number): Promise<Board> {
    try {
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found", 404);
      }
      const newInviteToken = randomUUID();
      return await boardModel.regenerateInviteLink(id, newInviteToken);
    } catch (error) {
      throw new InternalServerError("Failed to regenerate invite link");
    }
  }

  async disableInviteLink(id: number): Promise<Board> {
    try {
      const board = await boardModel.getById(id);
      if (!board) {
        throw new NotFoundError("Board not found", 404);
      }
      const disabledInvite = !board.invite_enabled;
      return await boardModel.disableInviteLink(id, disabledInvite);
    } catch (error) {
      throw new InternalServerError("Failed to disable invite link");
    }
  }

  async joinViaInviteLink(
    invite_token: string,
    userId: number
  ): Promise<BoardMember> {
    try {
      const board = await boardModel.getBoardByInviteToken(invite_token);
      if (!board) {
        throw new NotFoundError("Board not found", 404);
      }
      if (!board.invite_enabled) {
        throw new BadRequestError(
          "Invites are not enabled for this board",
          400
        );
      }
      const existingMember = await boardModel.isUserBoardMember(
        board.id,
        userId
      );
      if (existingMember) {
        throw new BadRequestError("User must not be a board member", 400);
      }
      return await boardModel.createInvitionUser(board.id, userId);
    } catch (error) {
      throw new InternalServerError("Failed to join invite link");
    }
  }

  async createInvitation(
    boardId: number,
    email: string,
    role: BoardRole,
    inviterId: number
  ): Promise<BoardInvitation> {
    try {
      const board = await boardModel.getById(boardId);
      if (!board) throw new NotFoundError("Board not found");

      const existingMember = await boardModel.findMemberByEmail(boardId, email);
      if (existingMember) throw new BadRequestError("User already a member");

      const existingInvite = await boardModel.findInvitation(boardId, email);
      if (existingInvite && existingInvite.status === "pending")
        throw new BadRequestError("Invitation already sent");

      const token = crypto.randomUUID();

      const invitation = await boardModel.createInvitation(
        boardId,
        email,
        role,
        token,
        inviterId
      );

      await mailService.sendInvitationEmailForBoard(email, token, board.name);

      return invitation;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in createInvitation:", error);
      throw new InternalServerError("Failed to create invitation");
    }
  }

  async acceptInvitation(token: string) {
    try {
      const invitation = await boardModel.findInvitationByToken(token);
      if (!invitation) throw new NotFoundError("Invalid or expired invitation");

      if (!invitation.board) {
        throw new InternalServerError("Board not loaded properly");
      }

      if (invitation.status === "accepted")
        throw new BadRequestError("Invitation already accepted");

      let user = await boardModel.findUserByEmail(invitation.email);
      if (!user) {
        user = await boardModel.createUser(invitation.email);
      }

      const existingMember = await boardModel.findMemberByEmail(
        invitation.board.id,
        invitation.email
      );

      if (!existingMember) {
        await boardModel.createMember(invitation.board, user, "member");
      }

      await boardModel.updateInvitationStatus(invitation, "accepted");

      return user;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in acceptInvitation:", error);
      throw new InternalServerError("Failed to accept invitation");
    }
  }
}

export default new BoardService();
