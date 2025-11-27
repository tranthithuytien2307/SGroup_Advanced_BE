import { Router } from "express";
import boardController from "../controllers/board.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { BoardSchema } from "../schemas/board.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";

const router = Router();

/**
 * -------------------------
 *   GET ALL BOARDS
 * -------------------------
 * Yêu cầu: phải là member của workspace chứa board.
 */
router.get(
  "/",
  authMiddleware,
  authorizeBoard(["admin", "member", "viewer"]),  
  asyncHandler(boardController.getAll)
);

/**
 * -------------------------
 *  GET BOARD BY ID
 * -------------------------
 * Quyền board: admin, member, viewer
 */
router.get(
  "/:board_id",
  authMiddleware,
  authorizeBoard(["admin", "member", "viewer"]),
  validateRequest(BoardSchema.GetById),
  asyncHandler(boardController.getById)
);

/**
 * -------------------------
 *   CREATE BOARD
 * -------------------------
 * Quyền workspace: owner, admin, member
 * Viewer workspace không được tạo board
 */
router.post(
  "/",
  authMiddleware,
  authorizeWorkspace(["owner", "admin", "member"]),
  validateRequest(BoardSchema.Create),
  asyncHandler(boardController.create)
);

/**
 * -------------------------
 *    UPDATE BOARD
 * -------------------------
 * Quyền board: admin, member
 */
router.put(
  "/:board_id",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  validateRequest(BoardSchema.Update),
  asyncHandler(boardController.update)
);

/**
 *  -------------------------
 *   UPDATE VISIBILITY
 *  -------------------------
 *  Quyền board: admin
 */
router.put(
  "/visibility/:board_id",
  authMiddleware,
  authorizeBoard(["admin"]),
  validateRequest(BoardSchema.UpdateVisibility),
  asyncHandler(boardController.updateVisibility)
)

/** 
 *  -------------------------
 *     ARCHIVE BOARD & UNARCHIVE BOARD
 *  -------------------------
 *  Quyền board: admin
 */
router.post(
  "/archive/:board_id",
  authMiddleware,
  authorizeBoard(["admin"]),
  validateRequest(BoardSchema.Archive),
  asyncHandler(boardController.archive)
)

router.post(
  "/unarchive/:board_id",
  authMiddleware,
  authorizeBoard(["admin"]),
  validateRequest(BoardSchema.Unarchive),
  asyncHandler(boardController.unarchive)
)

/**
 * -------------------------
 *   DELETE BOARD
 * -------------------------
 * Quyền board: admin
 */
router.delete(
  "/:board_id",
  authMiddleware,
  authorizeBoard(["admin"]),
  validateRequest(BoardSchema.Delete),
  asyncHandler(boardController.delete)
);

/**
 * ---------------------------------------------------------
 *   GET BOARDS BY WORKSPACE
 * ---------------------------------------------------------
 * Xét quyền workspace, không phải board.
 * Quyền workspace: owner, admin, member, viewer (ai trong workspace cũng có thể xem)
 */
router.get(
  "/workspace/:workspace_id",
  authMiddleware,
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  validateRequest(BoardSchema.GetByWorkspace),
  asyncHandler(boardController.getByWorkspaceId)
);

export default router;
