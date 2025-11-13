import { z } from "zod";

export const WorkspaceMemberSchema = {
  AddMember: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      role: z.enum(["owner", "admin", "member", "viewer"]),
    }),
    params: z.object({
      workspaceId: z.coerce.number().int().positive(),
    }),
  }),

  UpdateRole: z.object({
    body: z.object({
      role: z.enum(["owner", "admin", "member", "viewer"]),
    }),
    params: z.object({
      workspaceId: z.coerce.number().int().positive(),
      userId: z.coerce.number().int().positive(),
    }),
  }),
};

export type AddMemberInput = z.infer<
  typeof WorkspaceMemberSchema.AddMember
>["body"];
export type AddMemberParams = z.infer<
  typeof WorkspaceMemberSchema.AddMember
>["params"];

export type UpdateRoleInput = z.infer<
  typeof WorkspaceMemberSchema.UpdateRole
>["body"];
export type UpdateRoleParams = z.infer<
  typeof WorkspaceMemberSchema.UpdateRole
>["params"];
