import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Checklist } from "../entities/checklist.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

export const authorizeChecklistById = (requiredRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const checklistId =
        req.params.checklist_id ||
        req.params.id ||
        req.query.checklist_id ||
        req.body.checklist_id;

      if (Number.isNaN(Number(checklistId))) {
        throw new ForbiddenError("Invalid checklistId");
      }

      const checklistRepo = AppDataSource.getRepository(Checklist);

      const checklist = await checklistRepo.findOne({
        where: { id: Number(checklistId) },
        relations: ["card", "card.list", "card.list.board"],
      });

      if (!checklist) throw new ForbiddenError("Checklist not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: user.id },
          board: { id: checklist.card.list.board.id },
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

      // attach for downstream usage
      (req as any).checklist = checklist;
      (req as any).card = checklist.card;
      (req as any).boardId = checklist.card.list.board.id;

      next();
    } catch (error) {
      console.error("Checklist RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during checklist authorization"
      );
    }
  };
};
