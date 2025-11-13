import { email, z } from "zod";

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

  ForgotPassword: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
    }),
  }),

  ResetPassword: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      token: z.string().nonempty("Reset token is required"),
      newPassword: z.string().min(6, "Password musr be at least 6 characters"),
    }),
  }),

  ResendVerificationCode: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
    }),
  }),

  LoginWithGoogle: z.object({
    body: z.object({
      code: z.string().nonempty("Code of google is required"),
    }),
  }),
};

export type LoginInput = z.infer<typeof AuthSchema.Login>["body"];
export type RegisterInput = z.infer<typeof AuthSchema.Register>["body"];
export type RefreshTokenInput = z.infer<typeof AuthSchema.RefreshToken>["body"];
export type VerifyEmailInput = z.infer<typeof AuthSchema.VerifyEmail>["query"];
export type ForgotPassword = z.infer<typeof AuthSchema.ForgotPassword>["body"];
export type ResetPassword = z.infer<typeof AuthSchema.ResetPassword>["body"];
export type ResendVerificationCode = z.infer<
  typeof AuthSchema.ResendVerificationCode
>["body"];
export type LoginWithGoogle = z.infer<
  typeof AuthSchema.LoginWithGoogle
>["body"];
