import { Router } from "express";
import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";

export const healthCheckRegistry = new OpenAPIRegistry();
const router = Router();

const HealthResponse = z.object({
  status: z.string().openapi({ description: "Server status" }),
});

healthCheckRegistry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["HealthCheck"],
  responses: createApiResponse(HealthResponse, "Server is healthy"),
});

router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
