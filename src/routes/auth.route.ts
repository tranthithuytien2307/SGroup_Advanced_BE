import { Router } from "express";
import authController from "../controllers/auth.controllers";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../utils/http-handler";
import { AuthSchema } from "../schemas/auth.schema";

const router = Router();

router.post(
  "/login",
  validateRequest(AuthSchema.Login),
  asyncHandler(authController.loginUser)
);

router.post("/google/login", authController.loginWithGoogle);

router.post(
  "/register",
  validateRequest(AuthSchema.Register),
  asyncHandler(authController.registerUser)
);

router.get(
  "/verify-email",
  validateRequest(AuthSchema.VerifyEmail),
  asyncHandler(authController.verifyEmail)
);

router.post(
  "/refresh",
  validateRequest(AuthSchema.RefreshToken),
  asyncHandler(authController.refreshToken)
);

router.post("/resend-code", asyncHandler(authController.resendCode));

router.get(
  "/information",
  authMiddleware,
  asyncHandler(authController.getInformation)
);

export default router;
