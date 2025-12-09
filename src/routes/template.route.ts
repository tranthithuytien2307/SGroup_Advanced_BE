import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import asyncHandler from "../middleware/asyncHandler";
import { validateRequest } from "../utils/http-handler";

import templateController from "../controllers/template.controller";
import { TemplateSchema } from "../schemas/template.schema";

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

const router = Router();
export const templateRegistry = new OpenAPIRegistry();

templateRegistry.registerPath({
  method: "get",
  path: "api/templateBoard",
  tags: ["Template"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get all boards template"),
});

router.get(
  "/",
  authMiddleware,
  asyncHandler(templateController.getAllTemplates)
);

templateRegistry.registerPath({
  method: "post",
  path: "/api/templateBoard/:templateId/clone",
  tags: ["Template"],
  security: [{ BearerAuth: [] }],
  request: {
    params: TemplateSchema.CreateFromTemplateParams,
    body: {
      content: {
        "application/json": {
          schema: TemplateSchema.CreateFromTemplateBody,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), "Create board from template"),
});

router.post(
  "/:templateId/clone",
  authMiddleware,
  validateRequest(TemplateSchema.CreateFromTemplateParams, "params"),
  validateRequest(TemplateSchema.CreateFromTemplateBody, "body"),
  asyncHandler(templateController.createBoardFromTemplate)
);

export default router;
