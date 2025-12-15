import { Router } from "express";
import listController from "../controllers/list.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { authorizeBoard } from "../middleware/rbac-board.middleware";

const router = Router();

router.use(authMiddleware);

// Get lists by board
router.get(
  "/board/:boardId", 
  authMiddleware,
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(listController.getListsByBoard)
);

// Create list
router.post(
  "/",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  asyncHandler(listController.createList)
);

// Update list
router.patch(
  "/:id", 
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  asyncHandler(listController.updateList)
);

// Move list
router.post(
  "/:id/move",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  asyncHandler(listController.moveList)
);

// Copy list
router.post(
  "/:id/copy",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  asyncHandler(listController.copyList)
);

export default router;
