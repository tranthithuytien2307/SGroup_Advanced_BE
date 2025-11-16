import { z } from "zod";

export const BoardSchema = {
  GetById: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "Board ID must be a number"),
    }),
  }),

  Create: z.object({
    body: z.object({
      name: z.string().min(3, "Board name must be at least 3 characters"),
      workspace_id: z
        .number()
        .or(
          z
            .string()
            .regex(/^\d+$/, "Workspace ID must be a number")
            .transform(Number)
        ),
      cover_url: z.string().url("Invalid cover URL").optional(),
      description: z.string().optional().nullable(),
    }),
  }),

  Update: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "Board ID must be a number"),
    }),
    body: z
      .object({
        name: z.string().min(3).optional(),
        cover_url: z.string().url().optional(),
        description: z.string().optional().nullable(),
      })
      .refine((b) => Object.keys(b).length > 0, {
        message: "At least one field must be provided",
      }),
  }),

  Delete: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "Board ID must be a number"),
    }),
  }),

  GetByWorkspace: z.object({
    params: z.object({
      workspace_id: z.string().regex(/^\d+$/, "Workspace ID must be a number"),
    }),
  }),
};

export type CreateBoardInput = z.infer<typeof BoardSchema.Create>["body"];
export type UpdateBoardInput = z.infer<typeof BoardSchema.Update>["body"];
export type BoardParams = z.infer<typeof BoardSchema.GetById>["params"];
export type WorkspaceBoardParams = z.infer<
  typeof BoardSchema.GetByWorkspace
>["params"];
