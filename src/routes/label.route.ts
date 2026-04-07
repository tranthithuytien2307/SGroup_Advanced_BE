import { Router } from "express";
import labelController from "../controllers/label.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import asyncHandler from "../middleware/asyncHandler";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { authorizeBoard } from "../middleware/rbac-board.middleware";
import { validateRequest } from "../utils/http-handler";
import { LabelSchema } from "../schemas/label.schema";
import { authorizeCardById } from "../middleware/rbac.card.middleware";
import { authorizeLabelById } from "../middleware/rbac.label.middleware";

const router = Router();
export const labelRegistry = new OpenAPIRegistry();

labelRegistry.registerPath({
  method: "post",
  path: "/api/label",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.CreateLabel,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create label"),
});

router.post(
  "/",
  authMiddleware,
  authorizeBoard(["admin", "member"]),
  validateRequest(LabelSchema.CreateLabel, "body"),
  asyncHandler(labelController.createLabel),
);

labelRegistry.registerPath({
  method: "get",
  path: "/api/label/board/:board_id",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: { params: LabelSchema.GetById },
  responses: createApiResponse(z.null(), "Get labels by board Id"),
});

router.get(
  "/board/:board_id",
  authMiddleware,
  validateRequest(LabelSchema.GetById, "params"),
  authorizeBoard(["admin", "member", "viewer"]),
  asyncHandler(labelController.getLabelByBoardId),
);

labelRegistry.registerPath({
  method: "get",
  path: "/api/label/card/:card_id",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: { params: LabelSchema.GetById },
  responses: createApiResponse(z.null(), "Get labels by card Id"),
});

router.get(
  "/card/:card_id",
  authMiddleware,
  authorizeCardById(["admin", "member", "viewer"]),
  validateRequest(LabelSchema.GetByCardId, "params"),
  asyncHandler(labelController.getLabelsByCardId),
);

labelRegistry.registerPath({
  method: "put",
  path: "/api/label",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.UpdateLabel,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Update label"),
});

router.put(
  "/",
  authMiddleware,
  authorizeLabelById(["admin", "member"]),
  validateRequest(LabelSchema.UpdateLabel, "body"),
  asyncHandler(labelController.updateLabel),
);

labelRegistry.registerPath({
  method: "delete",
  path: "/api/label/:label_id",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    params: LabelSchema.DeleteLabel,
  },
  responses: createApiResponse(z.null(), "Delete label"),
});

router.delete(
  "/:label_id",
  authMiddleware,
  authorizeLabelById(["admin"]),
  validateRequest(LabelSchema.DeleteLabel, "params"),
  asyncHandler(labelController.deleteLabel),
);

labelRegistry.registerPath({
  method: "post",
  path: "/api/label/attach",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.AttachOrDetachLabelToCard,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Attach labels to card"),
});

router.post(
  "/attach",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(LabelSchema.AttachOrDetachLabelToCard, "body"),
  asyncHandler(labelController.attachLabelsToCard),
);

labelRegistry.registerPath({
  method: "post",
  path: "/api/label/detach",
  tags: ["Label"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LabelSchema.AttachOrDetachLabelToCard,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Attach labels to card"),
});

router.post(
  "/detach",
  authMiddleware,
  authorizeCardById(["admin", "member"]),
  validateRequest(LabelSchema.AttachOrDetachLabelToCard, "body"),
  asyncHandler(labelController.detachLabelsFromCard),
);

export default router;
