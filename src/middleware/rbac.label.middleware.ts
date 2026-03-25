import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Label } from "../entities/label.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

export const authorizeLabelById = (requiredRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const labelId =
        req.params.label_id ||
        req.params.id ||
        req.query.label_id ||
        req.body.label_id;

      if (!labelId || Number.isNaN(Number(labelId))) {
        throw new ForbiddenError("Invalid label_id");
      }

      const labelRepo = AppDataSource.getRepository(Label);

      const label = await labelRepo.findOne({
        where: { id: Number(labelId) },
      });

      if (!label) throw new ForbiddenError("Label not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: user.id },
          board: { id: label.board_id },
        },
      });

      if (!membership) {
        throw new ForbiddenError("You are not a member of this board");
      }

      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenError(
          `Permission denied: require [${requiredRoles.join(
            ", ",
          )}], but you are "${membership.role}"`,
        );
      }

      // attach để dùng tiếp
      (req as any).label = label;
      (req as any).boardId = label.board_id;

      next();
    } catch (error) {
      console.error("Label RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during label authorization",
      );
    }
  };
};
