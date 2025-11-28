import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const AuthSchema = {
  Login: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .openapi({ description: "User email" }),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .openapi({ description: "User password" }),
    })
    .openapi("LoginRequest"),

  Register: z
    .object({
      email: z.string().email().openapi({ description: "User email" }),
      password: z.string().min(6).openapi({ description: "User password" }),
      name: z.string().min(2).max(100).openapi({ description: "Full name" }),
    })
    .openapi("RegisterRequest"),

  RefreshToken: z
    .object({
      refreshToken: z
        .string()
        .nonempty("Refresh token is required")
        .openapi({ description: "Refresh token" }),
    })
    .openapi("RefreshTokenRequest"),

  VerifyEmail: z
    .object({
      email: z.string().email().openapi({ description: "Email to verify" }),
      code: z.string().openapi({ description: "Verification code" }),
    })
    .openapi("VerifyEmailQuery"),

  ForgotPassword: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .openapi({ description: "Email to send reset code" }),
    })
    .openapi("ForgotPasswordRequest"),

  ResetPassword: z
    .object({
      email: z.string().email().openapi({ description: "User email" }),
      token: z
        .string()
        .nonempty("Reset token is required")
        .openapi({ description: "Reset token" }),
      newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .openapi({ description: "New password" }),
    })
    .openapi("ResetPasswordRequest"),

  ResendVerificationCode: z
    .object({
      email: z
        .string()
        .email("Invalid email format")
        .openapi({ description: "Email to resend code" }),
    })
    .openapi("ResendCodeRequest"),

  LoginWithGoogle: z
    .object({
      code: z
        .string()
        .nonempty("Code of google is required")
        .openapi({ description: "Google OAuth code" }),
    })
    .openapi("LoginWithGoogleRequest"),
};

export type LoginInput = z.infer<typeof AuthSchema.Login>;
export type RegisterInput = z.infer<typeof AuthSchema.Register>;
export type RefreshTokenInput = z.infer<typeof AuthSchema.RefreshToken>;
export type VerifyEmailInput = z.infer<typeof AuthSchema.VerifyEmail>;
export type ForgotPasswordInput = z.infer<typeof AuthSchema.ForgotPassword>;
export type ResetPasswordInput = z.infer<typeof AuthSchema.ResetPassword>;
export type ResendVerificationCodeInput = z.infer<
  typeof AuthSchema.ResendVerificationCode
>;
export type LoginWithGoogleInput = z.infer<typeof AuthSchema.LoginWithGoogle>;
