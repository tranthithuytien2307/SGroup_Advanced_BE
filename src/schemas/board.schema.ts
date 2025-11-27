import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const BoardSchema = {
  GetById: z
    .object({
      id: z.string().regex(/^\d+$/, "Board ID must be a number").openapi({
        description: "Board ID",
      }),
    })
    .openapi("GetBoardByIdParams"),

  Create: z
    .object({
      name: z
        .string()
        .min(3, "Board name must be at least 3 characters")
        .openapi({
          description: "Board name",
        }),
      workspace_id: z
        .number()
        .or(
          z
            .string()
            .regex(/^\d+$/, "Workspace ID must be a number")
            .transform(Number)
        )
        .openapi({ description: "Workspace ID" }),
      cover_url: z
        .string()
        .url()
        .optional()
        .openapi({ description: "Cover URL" }),
      description: z
        .string()
        .optional()
        .nullable()
        .openapi({ description: "Description" }),
    })
    .openapi("CreateBoardRequest"),

  Update: z
    .object({
      name: z.string().min(3).optional().openapi({ description: "Board name" }),
      cover_url: z
        .string()
        .url()
        .optional()
        .openapi({ description: "Cover URL" }),
      description: z
        .string()
        .optional()
        .nullable()
        .openapi({ description: "Description" }),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: "At least one field must be provided",
    })
    .openapi("UpdateBoardRequest"),

  Delete: z
    .object({
      id: z
        .string()
        .regex(/^\d+$/, "Board ID must be a number")
        .openapi({ description: "Board ID" }),
    })
    .openapi("DeleteBoardParams"),

  GetByWorkspace: z
    .object({
      workspace_id: z
        .string()
        .regex(/^\d+$/, "Workspace ID must be a number")
        .openapi({
          description: "Workspace ID",
        }),
    })
    .openapi("GetBoardsByWorkspaceParams"),
};

export type CreateBoardInput = z.infer<typeof BoardSchema.Create>;
export type UpdateBoardInput = z.infer<typeof BoardSchema.Update>;
export type BoardParams = z.infer<typeof BoardSchema.GetById>;
export type WorkspaceBoardParams = z.infer<typeof BoardSchema.GetByWorkspace>;
