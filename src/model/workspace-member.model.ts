import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/workspace.entity";
import { User } from "../entities/user.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";

class WorkspaceMemberModel {
  private workspaceRepo = AppDataSource.getRepository(Workspace);
  private userRepo = AppDataSource.getRepository(User);
  private memberRepo = AppDataSource.getRepository(WorkspaceMember);

  async findWorkspaceById(id: number): Promise<Workspace | null> {
    try {
      return await this.workspaceRepo.findOne({ where: { id } });
    } catch (error) {
      console.error("Error in findWorkspaceById:", error);
      throw new Error("Failed to find workspace");
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { email } });
    } catch (error) {
      console.error("Error in findUserByEmail:", error);
      throw new Error("Failed to find user by email");
    }
  }

  async findMember(
    workspaceId: number,
    userId: number
  ): Promise<WorkspaceMember | null> {
    try {
      return await this.memberRepo.findOne({
        where: {
          workspace: { id: workspaceId },
          user: { id: userId },
        },
        relations: ["user", "workspace"],
      });
    } catch (error) {
      console.error("Error in findMember:", error);
      throw new Error("Failed to find member");
    }
  }

  async findMemberByEmail(
    workspaceId: number,
    email: string
  ): Promise<WorkspaceMember | null> {
    try {
      return await this.memberRepo.findOne({
        where: {
          workspace: { id: workspaceId },
          user: { email },
        },
        relations: ["user"],
      });
    } catch (error) {
      console.error("Error in findMemberByEmail:", error);
      throw new Error("Failed to find member by email");
    }
  }

  async createMember(
    workspace: Workspace,
    user: User,
    role: "owner" | "admin" | "member" | "viewer" = "member"
  ): Promise<WorkspaceMember> {
    try {
      const newMember = this.memberRepo.create({
        workspace,
        user,
        role,
      });
      return await this.memberRepo.save(newMember);
    } catch (error) {
      console.error("Error in createMember:", error);
      throw new Error("Failed to create workspace member");
    }
  }

  async getMembersByWorkspace(workspaceId: number): Promise<WorkspaceMember[]> {
    try {
      return await this.memberRepo.find({
        where: { workspace: { id: workspaceId } },
        relations: ["user"],
      });
    } catch (error) {
      console.error("Error in getMembersByWorkspace:", error);
      throw new Error("Failed to get members by workspace");
    }
  }

  async saveMember(member: WorkspaceMember): Promise<WorkspaceMember> {
    try {
      return await this.memberRepo.save(member);
    } catch (error) {
      console.error("Error in saveMember:", error);
      throw new Error("Failed to save workspace member");
    }
  }

  async deleteMember(workspaceId: number, userId: number): Promise<boolean> {
    try {
      const member = await this.findMember(workspaceId, userId);
      if (!member) return false;
      await this.memberRepo.remove(member);
      return true;
    } catch (error) {
      console.error("Error in deleteMember:", error);
      throw new Error("Failed to delete workspace member");
    }
  }
}

export default new WorkspaceMemberModel();
