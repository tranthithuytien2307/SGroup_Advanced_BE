import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Card } from "../entities/card.entity";
import { BoardMember, BoardRole } from "../entities/board-member.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

export const authorizeCardById = (requiredRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const cardId =
        req.params.card_id ||
        req.params.id ||
        req.query.card_id ||
        req.body.card_id;
      if (Number.isNaN(cardId)) {
        throw new ForbiddenError("Invalid cardId");
      }

      const cardRepo = AppDataSource.getRepository(Card);

      const card = await cardRepo.findOne({
        where: { id: cardId },
        relations: ["list", "list.board"],
      });

      if (!card) throw new ForbiddenError("Card not found");

      const boardMemberRepo = AppDataSource.getRepository(BoardMember);

      const membership = await boardMemberRepo.findOne({
        where: {
          user: { id: user.id },
          board: { id: card.list.board.id },
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
      (req as any).card = card;
      (req as any).boardId = card.list.board.id;

      next();
    } catch (error) {
      console.error("Card RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during card authorization"
      );
    }
  };
};
