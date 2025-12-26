import { Router } from "express";
import cardController from "../controllers/card.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/asyncHandler";
import { authorizeListByBody } from "../middleware/rbac.list.middleware";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { CardSchema } from "../schemas/card.schema";

const router = Router();
export const cardRegistry = new OpenAPIRegistry();

router.use(authMiddleware);

cardRegistry.registerPath({
  method: "post",
  path: "/api/card",
  tags: ["Card"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CardSchema.Create,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create card"),
});

router.post(
  "/",
  authMiddleware,
  authorizeListByBody(["admin", "member"]),
  asyncHandler(cardController.createCard)
);

export default router;
