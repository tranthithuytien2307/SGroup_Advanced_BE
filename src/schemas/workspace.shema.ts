import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const WorkspaceSchema = {
  GetById: z
    .object({
      workspace_id: z.string().regex(/^\d+$/, "Workspace ID must be a number").openapi({
        description: "Workspace ID",
      }),
    })
    .openapi("GetWorkspaceByIdParams"),

  Create: z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters").openapi({
        description: "Workspace name",
      }),
      description: z.string().nullable().optional().openapi({
        description: "Workspace description",
      }),
    })
    .openapi("CreateWorkspaceRequest"),

  Update: z
    .object({
      name: z
        .string()
        .min(3)
        .optional()
        .openapi({ description: "Workspace name" }),
      description: z
        .string()
        .nullable()
        .optional()
        .openapi({ description: "Workspace description" }),
      is_active: z
        .boolean()
        .optional()
        .openapi({ description: "Workspace active status" }),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    })
    .openapi("UpdateWorkspaceRequest"),

  Delete: z
    .object({
      id: z.string().regex(/^\d+$/, "Workspace ID must be a number").openapi({
        description: "Workspace ID",
      }),
    })
    .openapi("DeleteWorkspaceParams"),
};

export type CreateWorkspaceInput = z.infer<typeof WorkspaceSchema.Create>;
export type UpdateWorkspaceInput = z.infer<typeof WorkspaceSchema.Update>;
export type WorkspaceParams = z.infer<typeof WorkspaceSchema.GetById>;
