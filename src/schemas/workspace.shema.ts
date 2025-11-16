import { z } from "zod";

export const WorkspaceSchema = {
  GetById: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "Workspace ID must be a number"),
    }),
  }),

  Create: z.object({
    body: z.object({
      name: z.string().min(3, "Name must be at least 3 characters"),
      description: z.string().nullable().optional(),
    }),
  }),

  Update: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "Workspace ID must be a number"),
    }),
    body: z
      .object({
        name: z.string().min(3).optional(),
        description: z.string().nullable().optional(),
        is_active: z.boolean().optional(),
      })
      .refine((body) => Object.keys(body).length > 0, {
        message: "At least one field must be provided",
      }),
  }),

  Delete: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "Workspace ID must be a number"),
    }),
  }),
};

export type CreateWorkspaceInput = z.infer<typeof WorkspaceSchema.Create>["body"];
export type UpdateWorkspaceInput = z.infer<typeof WorkspaceSchema.Update>["body"];
export type WorkspaceParams = z.infer<typeof WorkspaceSchema.GetById>["params"];