import { Router } from "express";
import boardController from "../controllers/board.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { BoardSchema } from "../schemas/board.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";

const router = Router();

router.get("/", authMiddleware, asyncHandler(boardController.getAll));

router.get(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.GetById),
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(boardController.getById)
);

router.post(
  "/",
  authMiddleware,
  validateRequest(BoardSchema.Create),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(boardController.create)
);

router.put(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Update),
  authorizeBoard(["admin", "member"]),
  asyncHandler(boardController.update)
);

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Delete),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.delete)
);

router.get(
  "/workspace/:workspace_id",
  authMiddleware,
  validateRequest(BoardSchema.GetByWorkspace),
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(boardController.getByWorkspaceId)
);

export default router;
