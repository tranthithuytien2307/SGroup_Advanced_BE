import { Router } from "express";
import listController from "../controllers/list.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { authorizeListById } from "../middleware/rbac.list.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { ListSchema } from "../schemas/list.schema";
const router = Router();
export const listRegistery = new OpenAPIRegistry();

router.use(authMiddleware);

listRegistery.registerPath({
  method: "get",
  path: "/api/list/board/:board_id",
  tags: ["List"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all lists by board id"),
});

router.get(
  "/board/:board_id",
  authMiddleware,
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(listController.getListsByBoard)
);

listRegistery.registerPath({
  method: "post",
  path: "/api/list",
  tags: ["List"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ListSchema.Create,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create list"),
});

router.post(
  "/",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  asyncHandler(listController.createList)
);

listRegistery.registerPath({
  method: "patch",
  path: "/api/list/:id",
  tags: ["List"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: ListSchema.Update } } },
    params: ListSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Update List"),
});

router.patch(
  "/:id",
  authMiddleware,
  authorizeListById(["admin", "member"]),
  asyncHandler(listController.updateList)
);

listRegistery.registerPath({
  method: "put",
  path: "/api/list/:id/move",
  tags: ["List"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: ListSchema.Move } } },
    params: ListSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Move List"),
});

router.post(
  "/:id/move",
  authMiddleware,
  authorizeListById(["admin", "member"]),
  asyncHandler(listController.moveList)
);

listRegistery.registerPath({
  method: "put",
  path: "/api/list/:id/copy",
  tags: ["List"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: ListSchema.Copy } } },
    params: ListSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Copy List"),
});

router.post(
  "/:id/copy",
  authMiddleware,
  authorizeListById(["admin", "member"]),
  asyncHandler(listController.copyList)
);

listRegistery.registerPath({
  method: "put",
  path: "/api/list/:id/reorder",
  tags: ["List"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: ListSchema.Reorder } } },
    params: ListSchema.GetById,
  },
  responses: createApiResponse(z.null(), "Reorder List"),
});

router.put(
  "/:id/reorder",
  authMiddleware,
  authorizeListById(["admin", "member"]),
  asyncHandler(listController.reorderList)
);

export default router;
