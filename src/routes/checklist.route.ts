import { Router } from "express";
import checklistController from "../controllers/checklist.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import asyncHandler from "../middleware/asyncHandler";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { validateRequest } from "../utils/http-handler";
import { ChecklistSchema } from "../schemas/checklist.schema";
import { authorizeCardById } from "../middleware/rbac.card.middleware";
import { authorizeChecklistById } from "../middleware/rbac.checklist.middleware";
import { authorizeChecklistItemById } from "../middleware/rbac.checklist-item.middleware";

const router = Router();
export const checklistRegistry = new OpenAPIRegistry();

checklistRegistry.registerPath({
  method: "post",
  path: "/api/checklist",
  tags: ["Checklist"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChecklistSchema.CreateChecklist,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create checklist"),
});

router.post(
  "/",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(ChecklistSchema.CreateChecklist, "body"),
  asyncHandler(checklistController.createChecklist)
);

checklistRegistry.registerPath({
  method: "post",
  path: "/api/checklist/item",
  tags: ["Checklist"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChecklistSchema.AddItem,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Add checklist item"),
});

router.post(
  "/item",
  authMiddleware,
  authorizeChecklistById(["admin", "member"]),
  validateRequest(ChecklistSchema.AddItem, "body"),
  asyncHandler(checklistController.addItem)
);

checklistRegistry.registerPath({
  method: "put",
  path: "/api/checklist/item",
  tags: ["Checklist"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChecklistSchema.UpdateItem,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Update checklist item"),
});

router.put(
  "/item",
  authMiddleware,
  authorizeChecklistItemById(["admin", "member"]),
  validateRequest(ChecklistSchema.UpdateItem, "body"),
  asyncHandler(checklistController.updateItem)
);

checklistRegistry.registerPath({
  method: "patch",
  path: "/api/checklist/item/toggle",
  tags: ["Checklist"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChecklistSchema.ToggleItem,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Toggle checklist item"),
});

router.patch(
  "/item/toggle",
  authMiddleware,
  authorizeChecklistItemById(["admin", "member"]),
  validateRequest(ChecklistSchema.ToggleItem, "body"),
  asyncHandler(checklistController.toggleItem)
);

checklistRegistry.registerPath({
  method: "delete",
  path: "/api/checklist/item/{id}",
  tags: ["Checklist"],
  security: [{ BearerAuth: [] }],
  request: {
    params: ChecklistSchema.ItemIdParam,
  },
  responses: createApiResponse(z.null(), "Delete checklist item"),
});

router.delete(
  "/item/:id",
  authMiddleware,
  authorizeChecklistItemById(["admin", "member"]),
  validateRequest(ChecklistSchema.ItemIdParam, "params"),
  asyncHandler(checklistController.deleteItem)
);

checklistRegistry.registerPath({
  method: "get",
  path: "/api/checklist/{id}/progress",
  tags: ["Checklist"],
  security: [{ BearerAuth: [] }],
  request: {
    params: ChecklistSchema.ChecklistIdParam,
  },
  responses: createApiResponse(z.number(), "Get checklist progress"),
});

router.get(
  "/:id/progress",
  authMiddleware,
  authorizeChecklistItemById(["admin", "member", "viewer"]),
  validateRequest(ChecklistSchema.ChecklistIdParam, "params"),
  asyncHandler(checklistController.getProgress)
);

export default router;
