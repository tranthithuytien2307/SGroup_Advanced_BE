import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { List } from "../entities/list.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

export const authorizeListById = (requiredRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const listId = Number(req.params.id);
      if (Number.isNaN(listId)) {
        throw new ForbiddenError("Invalid listId");
      }

      const listRepo = AppDataSource.getRepository(List);

      const list = await listRepo.findOne({
        where: { id: listId },
        relations: ["board"],
      });

      if (!list) throw new ForbiddenError("List not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: user.id },
          board: { id: list.board.id },
        },
      });

      if (!membership) {
        throw new ForbiddenError("You are not a member of this board");
      }

      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenError(
          `Permission denied: require [${requiredRoles.join(
            ", "
          )}], but you are "${membership.role}"`
        );
      }

      // attach boardId for downstream usage if needed
      (req as any).boardId = list.board.id;

      next();
    } catch (error) {
      console.error("List RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during list authorization"
      );
    }
  };
};

export const authorizeListByBody = (requiredRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const listId = Number(req.body.list_id);
      if (Number.isNaN(listId)) {
        throw new ForbiddenError("Invalid listId");
      }

      const listRepo = AppDataSource.getRepository(List);

      const list = await listRepo.findOne({
        where: { id: listId },
        relations: ["board"],
      });

      if (!list) throw new ForbiddenError("List not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: user.id },
          board: { id: list.board.id },
        },
      });

      if (!membership) {
        throw new ForbiddenError("You are not a member of this board");
      }

      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenError(
          `Permission denied: require [${requiredRoles.join(
            ", "
          )}], but you are "${membership.role}"`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthFailureError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError(
        "Internal Server Error during list authorization"
      );
    }
  };
};
