import { Router } from "express";
import boardMemberController from "../controllers/board-member.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { BoardMemberSchema } from "../schemas/board-member.schema";
import z from "zod";

const router = Router();
export const boardMemberRegistry = new OpenAPIRegistry();

router.use(authMiddleware);

boardMemberRegistry.registerPath({
  method: "get",
  path: "/api/board-member/{board_id}",
  tags: ["BoardMember"],
  security: [{ BearerAuth: [] }],
  request: {
    params: BoardMemberSchema.GetByBoardId,
  },
  responses: createApiResponse(z.array(z.any()), "Get board members"),
});

router.get(
  "/:board_id",
  validateRequest(BoardMemberSchema.GetByBoardId, "params"),
  asyncHandler(boardMemberController.getBoardMembers),
);

export default router;
