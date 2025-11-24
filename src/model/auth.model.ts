import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import crypto from "crypto";

class AuthModel {
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { email },
        select: [
          "id",
          "email",
          "password",
          "name",
          "isVerified",
          "verifyToken",
          "role",
          "refreshToken",
        ],
      });

      return user;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      throw new Error("Database query failed");
    }
  }

  async createUser(
    email: string,
    hashedPassword: string,
    user: string
  ): Promise<User> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;
      newUser.name = user;
      newUser.isVerified = false;
      newUser.verifyToken = crypto.randomBytes(32).toString("hex");

      return await userRepository.save(newUser);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw new Error("Failed to create user");
    }
  }

  async createUserWithGoogle(
    email: string,
    name: string,
    provider: string,
    provider_id: string,
    avatar_url?: string
  ): Promise<User> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      const newUser = new User();
      newUser.email = email;
      newUser.name = name;
      newUser.password = null;
      newUser.isVerified = true;
      newUser.is_oauth = true;
      newUser.provider = provider;
      newUser.provider_id = provider_id;
      newUser.avatar_url = avatar_url || null;

      return await userRepository.save(newUser);
    } catch (error) {
      console.error("Error in createUserWithGoogle:", error);
      throw new Error("Failed to create OAuth user");
    }
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update(userId, { refreshToken });
    } catch (error) {
      console.error("Error in updateRefreshToken:", error);
      throw new Error("Failed to update refresh token");
    }
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User | null> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      return await userRepository.findOne({ where: { refreshToken } });
    } catch (error) {
      console.error("Error in getUserByRefreshToken:", error);
      throw new Error("Failed to get user by refresh token");
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        select: ["id", "email", "name", "role", "isVerified", "avatar_url"],
      });
      return user;
    } catch (err) {
      console.log("Error in getUserById: ", err);
      throw new Error("Failed to get user by ID");
    }
  }
  async updatePasswordByEmail(
    email: string,
    hashedPassword: string
  ): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update({ email }, { password: hashedPassword });
    } catch (error) {
      console.log("Error in updatePasswordByEmail:", error);
      throw new Error("Failed to update password");
    }
  }
}

export default new AuthModel();
