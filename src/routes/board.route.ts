import { Router } from "express";
import boardController from "../controllers/board.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { BoardSchema } from "../schemas/board.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeBoard } from "../middleware/rbac-board.middleware";

const router = Router();

router.get("/", authMiddleware, asyncHandler(boardController.getAll));

router.get(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.GetById),
  asyncHandler(boardController.getById),
  authorizeBoard(["admin", "member", "viewer"])
);

router.post(
  "/",
  authMiddleware,
  validateRequest(BoardSchema.Create),
  asyncHandler(boardController.create),
  authorizeBoard(["admin", "member"])
);

router.put(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Update),
  asyncHandler(boardController.update),
  authorizeBoard(["admin", "member"])
);

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Delete),
  asyncHandler(boardController.delete),
  authorizeBoard(["admin"])
);

router.get(
  "/workspace/:workspace_id",
  authMiddleware,
  validateRequest(BoardSchema.GetByWorkspace),
  asyncHandler(boardController.getByWorkspaceId),
  authorizeBoard(["admin", "member", "viewer"])
);

export default router;
