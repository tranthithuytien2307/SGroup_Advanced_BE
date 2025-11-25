import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

class UserModel {
  private userRepository = AppDataSource.getRepository(User);

  async getAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      console.error("Error in getAll:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id: userId },
        select: [
          "id",
          "name",
          "email",
          "roleId",
          "isVerified",
          "avatar_url",
          "provider",
        ],
      });
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw new Error("Failed to get user by ID");
    }
  }

  async createUser(data: Partial<User>): Promise<User> {
    try {
      const newUser = this.userRepository.create(data);
      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUserProfile(
    userId: number,
    data: Partial<User>
  ): Promise<User | null> {
    try {
      await this.userRepository.update({ id: userId }, data);
      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  async updateUserAvatar(
    userId: number,
    avatarUrl: string
  ): Promise<User | null> {
    try {
      await this.userRepository.update(userId, { avatar_url: avatarUrl });
      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error in updateUserAvatar:", error);
      throw new Error("Failed to update avatar");
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const result = await this.userRepository.delete(userId);
      return !!(result.affected && result.affected > 0);
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw new Error("Failed to delete user");
    }
  }
}

export default new UserModel();
