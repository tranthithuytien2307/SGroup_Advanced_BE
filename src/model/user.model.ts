import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

class UserModel {
  private userRepository = AppDataSource.getRepository(User);

  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(userId: number): Promise<User | null> {
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
  }

  async createUser(data: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(data);
    return await this.userRepository.save(newUser);
  }

  async updateUserProfile(
    userId: number,
    data: Partial<User>
  ): Promise<User | null> {
    await this.userRepository.update({ id: userId }, data);
    return await this.getUserById(userId);
  }

  async updateUserAvatar(
    userId: number,
    avatarUrl: string
  ): Promise<User | null> {
    await this.userRepository.update(userId, { avatar_url: avatarUrl });
    return await this.getUserById(userId);
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await this.userRepository.delete(userId);
    return !!(result.affected && result.affected > 0);
  }
}

export default new UserModel();
