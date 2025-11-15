import { User } from "../entities/user.entity";
import userModel from "../model/user.model";
import cloudinary from "../utils/cloudinary";
import {
  BadRequestError,
  ErrorResponse,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";

class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      return await userModel.getAll();
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw new InternalServerError("Failed to fetch users");
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const user = await userModel.getUserById(userId);
      if (!user) throw new NotFoundError("User not found");
      return user;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in getUserById:", error);
      throw new InternalServerError("Failed to fetch user");
    }
  }

  async createUser(data: Partial<User>): Promise<User> {
    try {
      return await userModel.createUser(data);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw new InternalServerError("Failed to create user");
    }
  }

  async updateUser(userId: number, data: Partial<User>): Promise<User | null> {
    try {
      const user = await userModel.getUserById(userId);
      if (!user) throw new NotFoundError("User not found");

      const updated = await userModel.updateUserProfile(userId, data);
      return updated;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in updateUser:", error);
      throw new InternalServerError("Failed to update user");
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const deleted = await userModel.deleteUser(userId);
      if (!deleted) throw new NotFoundError("User not found");
      return true;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in deleteUser:", error);
      throw new InternalServerError("Failed to delete user");
    }
  }

  async updateProfile(userId: number, data: Partial<User>) {
    try {
      const user = await userModel.getUserById(userId);
      if (!user) throw new BadRequestError("User not found");

      const updated = await userModel.updateUserProfile(userId, data);
      return updated;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in updateProfile:", error);
      throw new InternalServerError("Failed to update profile");
    }
  }

  async uploadAvatar(userId: number, filePath: string) {
    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: "avatars",
      });

      const updated = await userModel.updateUserAvatar(
        userId,
        uploadResult.secure_url
      );
      return updated;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in uploadAvatar:", error);
      throw new InternalServerError("Failed to upload avatar");
    }
  }
}

export default new UserService();
