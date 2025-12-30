import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { ChecklistItem } from "../entities/checklist-item.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

export const authorizeChecklistItemById = (requiredRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const itemId =
        req.params.item_id ||
        req.params.id ||
        req.query.item_id ||
        req.body.item_id;

      if (Number.isNaN(Number(itemId))) {
        throw new ForbiddenError("Invalid checklist item id");
      }

      const itemRepo = AppDataSource.getRepository(ChecklistItem);

      const item = await itemRepo.findOne({
        where: { id: Number(itemId) },
        relations: [
          "checklist",
          "checklist.card",
          "checklist.card.list",
          "checklist.card.list.board",
        ],
      });

      if (!item) throw new ForbiddenError("Checklist item not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: user.id },
          board: { id: item.checklist.card.list.board.id },
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
      (req as any).checklistItem = item;
      (req as any).checklist = item.checklist;
      (req as any).card = item.checklist.card;
      (req as any).boardId = item.checklist.card.list.board.id;

      next();
    } catch (error) {
      console.error("ChecklistItem RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during checklist item authorization"
      );
    }
  };
};
