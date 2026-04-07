import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const WorkspaceMemberSchema = {
  AddMember: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .openapi({ description: "Email of the user to add" }),
      role: z
        .enum(["owner", "admin", "member", "viewer"])
        .openapi({ description: "Role in workspace" }),
    })
    .openapi("AddMemberRequest"),

  Invite: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .openapi({ description: "Email of the user to invite" }),
      role: z
        .enum(["admin", "member", "viewer"])
        .openapi({ description: "Role in workspace" }),
    })
    .openapi("InviteMemberRequest"),

  UpdateRole: z
    .object({
      role: z
        .enum(["owner", "admin", "member", "viewer"])
        .openapi({ description: "New role of the member" }),
    })
    .openapi("UpdateMemberRoleRequest"),

  ParamsWorkspaceId: z
    .object({
      workspaceId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({ description: "Workspace ID" }),
    })
    .openapi("WorkspaceIdParam"),

  ParamsWorkspaceUser: z
    .object({
      workspaceId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({ description: "Workspace ID" }),
      userId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({ description: "User ID" }),
    })
    .openapi("WorkspaceUserParams"),
};

export type AddMemberInput = z.infer<typeof WorkspaceMemberSchema.AddMember>;
export type AddMemberParams = z.infer<
  typeof WorkspaceMemberSchema.ParamsWorkspaceId
>;

export type InviteMemberInput = z.infer<typeof WorkspaceMemberSchema.Invite>;
export type InviteMemberParams = z.infer<
  typeof WorkspaceMemberSchema.ParamsWorkspaceId
>;

export type UpdateRoleInput = z.infer<typeof WorkspaceMemberSchema.UpdateRole>;
export type UpdateRoleParams = z.infer<
  typeof WorkspaceMemberSchema.ParamsWorkspaceUser
>;
