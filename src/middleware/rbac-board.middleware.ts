import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { BoardMember } from "../entities/board-member.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

/** 
 * This middleware uses RBAC to authorize user actions on boards.
 * It checks if the user has the required role in the specified board.
 */

export const authorizeBoard = (
  requiredRoles: ("admin" | "member" | "viewer")[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const userId = user.id;

      // Get board_id from:
      // - params
      // - query
      // - body
      const boardId =
        req.params.board_id ||
        req.query.board_id ||
        req.body.board_id;

      if (!boardId) {
        throw new ForbiddenError("Missing board_id in request");
      }

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: userId },
          board: { id: Number(boardId) },
        },
        relations: ["board", "user"],
      });

      if (!membership) {
        throw new ForbiddenError("You are not a member of this board");
      }

      // Check role
      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenError(
          `Board permission denied: require [${requiredRoles.join(", ")}], but you are "${membership.role}"`
        );
      }

      next();
    } catch (error) {
      console.error("Board RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during board authorization"
      );
    }
  };
};
