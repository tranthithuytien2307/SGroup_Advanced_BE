import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const UserSchema = {
  GetById: z
    .object({
      id: z.string().regex(/^\d+$/, "User ID must be a number").openapi({
        description: "User ID",
      }),
    })
    .openapi("GetUserByIdParams"),

  Create: z
    .object({
      name: z.string().min(2).max(100).openapi({ description: "Full name" }),
      email: z.string().email().openapi({ description: "User email" }),
      password: z.string().min(6).openapi({ description: "User password" }),
      role: z.string().optional().openapi({ description: "User role" }),
    })
    .openapi("CreateUserRequest"),

  Update: z
    .object({
      name: z
        .string()
        .min(2)
        .max(100)
        .optional()
        .openapi({ description: "Full name" }),
      email: z
        .string()
        .email()
        .optional()
        .openapi({ description: "User email" }),
      password: z
        .string()
        .min(6)
        .optional()
        .openapi({ description: "User password" }),
      role: z.string().optional().openapi({ description: "User role" }),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: "At least one field must be provided",
    })
    .openapi("UpdateUserRequest"),

  Delete: z
    .object({
      id: z.string().regex(/^\d+$/, "User ID must be a number").openapi({
        description: "User ID",
      }),
    })
    .openapi("DeleteUserParams"),

  UpdateProfile: z
    .object({
      name: z
        .string()
        .min(2)
        .max(100)
        .optional()
        .openapi({ description: "Full name" }),

      email: z
        .string()
        .email()
        .optional()
        .openapi({ description: "User email" }),

      bio: z
        .union([z.string().max(500), z.null()])
        .optional()
        .openapi({ description: "User bio" }),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: "At least one field must be provided",
    })
    .openapi("UpdateUserProfileRequest"),

  AvatarPresign: z
    .object({
      file_name: z.string().min(1).openapi({ description: "Original file name" }),
      content_type: z
        .string()
        .min(1)
        .openapi({ description: "MIME type of avatar file" }),
    })
    .openapi("CreateAvatarPresignRequest"),

  UpdateAvatar: z
    .object({
      avatar_url: z.string().url().openapi({ description: "Uploaded avatar URL" }),
    })
    .openapi("UpdateAvatarRequest"),
};

export type CreateUserInput = z.infer<typeof UserSchema.Create>;
export type UpdateUserInput = z.infer<typeof UserSchema.Update>;
export type UserParams = z.infer<typeof UserSchema.GetById>;
