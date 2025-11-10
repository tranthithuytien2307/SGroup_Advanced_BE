import { z } from "zod";

export const AuthSchema = {
  Login: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  }),

  Register: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2).max(100),
    }),
  }),

  RefreshToken: z.object({
    body: z.object({
      refreshToken: z.string().nonempty("Refresh token is required"),
    }),
  }),

  VerifyEmail: z.object({
    query: z.object({
      email: z.string().email(),
      code: z.string(),
    }),
  }),
};

export type LoginInput = z.infer<typeof AuthSchema.Login>["body"];
export type RegisterInput = z.infer<typeof AuthSchema.Register>["body"];
export type RefreshTokenInput = z.infer<typeof AuthSchema.RefreshToken>["body"];
export type VerifyEmailInput = z.infer<typeof AuthSchema.VerifyEmail>["query"];
