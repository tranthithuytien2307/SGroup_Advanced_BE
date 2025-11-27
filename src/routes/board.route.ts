import { Router } from "express";
import boardController from "../controllers/board.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";
import { BoardSchema } from "../schemas/board.schema";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { authorizeWorkspace } from "../middleware/rbac-workspace.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

export const boardRegistry = new OpenAPIRegistry();
const router = Router();

boardRegistry.registerPath({
  method: "get",
  path: "/api/boards",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all boards"),
});

router.get("/", authMiddleware, asyncHandler(boardController.getAll));

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetById },
  responses: createApiResponse(z.null(), "Get board by ID"),
});

router.get(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.GetById),
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(boardController.getById)
);

boardRegistry.registerPath({
  method: "post",
  path: "/api/board",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: BoardSchema.Create } } },
  },
  responses: createApiResponse(z.null(), "Create board"),
});

router.post(
  "/",
  authMiddleware,
  validateRequest(BoardSchema.Create),
  authorizeWorkspace(["owner", "admin", "member"]),
  asyncHandler(boardController.create)
);

boardRegistry.registerPath({
  method: "put",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: BoardSchema.Update } } },
    params: BoardSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Update board"),
});

router.put(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Update),
  authorizeBoard(["admin", "member"]),
  asyncHandler(boardController.update)
);

boardRegistry.registerPath({
  method: "delete",
  path: "/api/board/:id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.Delete },
  responses: createApiResponse(z.null(), "Delete board"),
});

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(BoardSchema.Delete),
  authorizeBoard(["admin"]),
  asyncHandler(boardController.delete)
);

boardRegistry.registerPath({
  method: "get",
  path: "/api/board/workspace/:workspace_id",
  tags: ["Board"],
  security: [{ BearerAuth: [] }],
  request: { params: BoardSchema.GetByWorkspace },
  responses: createApiResponse(z.null(), "Get boards by workspace"),
});

router.get(
  "/workspace/:workspace_id",
  authMiddleware,
  validateRequest(BoardSchema.GetByWorkspace),
  authorizeWorkspace(["owner", "admin", "member", "viewer"]),
  asyncHandler(boardController.getByWorkspaceId)
);

export default router;
