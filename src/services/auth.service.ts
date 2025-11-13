import authModel from "../model/auth.model";
import hashProvides from "../provides/hash.provides";
import { userProvides } from "../provides/user.provides";
import { User } from "../entities/user.entity";
import mailService from "./mail.service";
import { AppDataSource } from "../data-source";
import { redisClient } from "../redisClient";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  AuthFailureError,
  ErrorResponse,
} from "../handler/error.response";
import * as crypto from "crypto";
import axios from "axios";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

class AuthService {
  async loginUser(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const user = await authModel.getUserByEmail(email);
      if (!user) {
        throw new BadRequestError("User not found");
      }

      if (!user.isVerified) {
        throw new ForbiddenError("Please verify your email before logging in");
      }

      const check = await hashProvides.compareHash(password, user.password!);
      if (!check) {
        throw new AuthFailureError("Incorrect password");
      }

      const accessToken = await userProvides.encodeToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      const refreshToken = await userProvides.encodeRefreshToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      user.refreshToken = refreshToken;
      await authModel.updateRefreshToken(user.id, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to login user");
    }
  }

  async loginWithGoogle(code: string) {
    try {
      const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const { access_token, id_token } = tokenResponse.data;

      if (!access_token || !id_token) {
        throw new Error("Missing access_token or id_token from Google");
      }

      const userInfoResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
      );

      const {
        email,
        name,
        id: provider_id,
        picture: avatar_url,
      } = userInfoResponse.data;

      let user = await authModel.getUserByEmail(email);
      if (!user) {
        console.log("[GoogleLogin] User not found, creating new user");
        user = await authModel.createUserWithGoogle(
          email,
          name,
          "google",
          provider_id,
          avatar_url
        );
      } else {
        console.log("[GoogleLogin] User found:", user.id);
      }

      const accessToken = await userProvides.encodeToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      const refreshToken = await userProvides.encodeRefreshToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      await authModel.updateRefreshToken(user.id, refreshToken);

      return { user, accessToken, refreshToken };
    } catch (err: any) {
      throw {
        message: "Failed to login with Google",
        detail: err.response?.data || err.message,
      };
    }
  }

  async registerUser(
    email: string,
    password: string,
    name: string
  ): Promise<string> {
    try {
      const existingUser = (await authModel.getUserByEmail(
        email
      )) as User | null;
      if (existingUser) {
        throw new ErrorResponse("User already exists", 409);
      }

      const { hashString } = await hashProvides.generateHash(password);

      const newUser = await authModel.createUser(email, hashString, name);

      const verifyCode = crypto.randomBytes(3).toString("hex");
      await redisClient.setEx(`verify:${email}`, 300, verifyCode);

      await mailService.sendVerificationEmail(newUser.email, verifyCode);

      return "Registration success, please check your email to verify.";
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to register user");
    }
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    try {
      const savedCode = await redisClient.get(`verify:${email}`);
      if (!savedCode) {
        throw new Error("Verification code expired or not found");
      }
      if (savedCode !== code) {
        throw new Error("Invalid verification code");
      }

      const user = await authModel.getUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      user.isVerified = true;
      await AppDataSource.getRepository(User).save(user);

      await redisClient.del(`verify:${email}`);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to verify email");
    }
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      if (!refreshToken) {
        throw new BadRequestError("Refresh token is required");
      }

      await userProvides.verifyRefreshToken(refreshToken);

      const user = await authModel.getUserByRefreshToken(refreshToken);
      if (!user) {
        throw new ErrorResponse("Invalid refresh token", 401);
      }

      const accessToken = await userProvides.encodeToken({
        id: user.id,
        role: user.role,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new AuthFailureError("Invalid or expired refresh token");
    }
  }

  async getUserInformation(userId: number): Promise<User | null> {
    try {
      const user = await authModel.getUserById(userId);
      if (!user) {
        throw new ErrorResponse("User not found", 404);
      }
      return user;
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to fetch user information");
    }
  }
  async resendVerificationCode(email: string): Promise<void> {
    const user = await authModel.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.isVerified) {
      throw new Error("User already verified");
    }

    const verifyCode = crypto.randomBytes(3).toString("hex");
    await redisClient.setEx(`verify:${email}`, 300, verifyCode);

    await mailService.sendVerificationEmail(user.email, verifyCode);
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await authModel.getUserByEmail(email);
      if (!user) throw new BadRequestError("User not found");

      const resetToken = crypto.randomBytes(20).toString("hex");
      await redisClient.setEx(`reset:${email}`, 900, resetToken);

      const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?email=${email}&token=${resetToken}`;
      await mailService.sendEmail(email, resetLink);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new InternalServerError("Failed to send reset email");
    }
  }
  async resetPassword(email: string, token: string, newPassword: string): Promise<void>{
    try{
      const savedToken = await redisClient.get(`reset:${email}`);
      if (!savedToken || savedToken !== token) throw new BadRequestError("Invalid or expired token");

      const { hashString } = await hashProvides.generateHash(newPassword);
      await authModel.updatePasswordByEmail(email, hashString);

      await redisClient.del(`reset:${email}`);
    } catch( error ){
      if (error instanceof ErrorResponse){
        throw error;
      }
       throw new InternalServerError("Failed to reset password");
    }
  }
}

export default new AuthService();
