import { Router } from "express";
import authController from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../utils/http-handler";
import { AuthSchema } from "../schemas/auth.schema";

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "../api-docs/openAPIResponseBuilders";
import { z } from "zod";

export const authRegistry = new OpenAPIRegistry();
const router = Router();

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: AuthSchema.Login } } },
  },
  responses: createApiResponse(z.null(), "Login successfully"),
});

router.post(
  "/login",
  validateRequest(AuthSchema.Login),
  asyncHandler(authController.loginUser)
);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/google/login",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthSchema.LoginWithGoogle } },
    },
  },
  responses: createApiResponse(z.null(), "Login with Google successfully"),
});

router.post(
  "/google/login",
  validateRequest(AuthSchema.LoginWithGoogle),
  authController.loginWithGoogle
);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  request: {
    body: { content: { "application/json": { schema: AuthSchema.Register } } },
  },
  responses: createApiResponse(z.null(), "Register successfully"),
});

router.post(
  "/register",
  validateRequest(AuthSchema.Register),
  asyncHandler(authController.registerUser)
);

authRegistry.registerPath({
  method: "get",
  path: "/api/auth/verify-email",
  tags: ["Auth"],
  request: { query: AuthSchema.VerifyEmail },
  responses: createApiResponse(z.null(), "Email verified"),
});

router.get(
  "/verify-email",
  validateRequest(AuthSchema.VerifyEmail),
  asyncHandler(authController.verifyEmail)
);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthSchema.RefreshToken } },
    },
  },
  responses: createApiResponse(z.null(), "Refresh token successfully"),
});

router.post(
  "/refresh",
  validateRequest(AuthSchema.RefreshToken),
  asyncHandler(authController.refreshToken)
);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/forgot-password",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthSchema.ForgotPassword } },
    },
  },
  responses: createApiResponse(z.null(), "Send forgot password mail"),
});

router.post(
  "/forgot-password",
  validateRequest(AuthSchema.ForgotPassword),
  authController.forgotPassword
);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/reset-password",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthSchema.ResetPassword } },
    },
  },
  responses: createApiResponse(z.null(), "Reset password successfully"),
});

router.post(
  "/reset-password",
  validateRequest(AuthSchema.ResetPassword),
  authController.resetPassword
);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/resend-code",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": { schema: AuthSchema.ResendVerificationCode },
      },
    },
  },
  responses: createApiResponse(z.null(), "Resend verification code"),
});

router.post(
  "/resend-code",
  validateRequest(AuthSchema.ResendVerificationCode),
  asyncHandler(authController.resendCode)
);

authRegistry.registerPath({
  method: "get",
  path: "/api/auth/information",
  tags: ["Auth"],
  security: [{ BearerAuth: [] }],
  responses: createApiResponse(z.null(), "Get user information"),
});

router.get(
  "/information",
  authMiddleware,
  asyncHandler(authController.getInformation)
);

export default router;
