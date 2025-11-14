import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/workspace.entity";
import { User } from "../entities/user.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";
import { WorkspaceInvitation } from "../entities/workspace-invitations.entity";

class WorkspaceMemberModel {
  private workspaceRepo = AppDataSource.getRepository(Workspace);
  private userRepo = AppDataSource.getRepository(User);
  private memberRepo = AppDataSource.getRepository(WorkspaceMember);
  private invitationRepo = AppDataSource.getRepository(WorkspaceInvitation);

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

  async createUser(email: string, name?: string): Promise<User> {
    try {
      const user = this.userRepo.create({
        email,
        name: name || email.split("@")[0],
        password: null,
      });
      return await this.userRepo.save(user);
    } catch (error) {
      console.error("Error in cteateUser: ", error);
      throw new Error("Failed to create user");
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

  async createInvitation(
    email: string,
    workspace: Workspace,
    workspace_id: number,
    status: "pending" | "accepted" | "expired",
    token: string,
    invited_by_id: number
  ): Promise<WorkspaceInvitation> {
    try {
      const invitation = this.invitationRepo.create({
        email,
        workspace,
        workspace_id,
        status,
        token,
        invited_by_id,
      });
      return await this.invitationRepo.save(invitation);
    } catch (error) {
      console.error("Error in create invitation: ", error);
      throw new Error("Failed to create invitation");
    }
  }

  async findInvitationByToken(
    token: string
  ): Promise<WorkspaceInvitation | null> {
    try {
      return await this.invitationRepo.findOne({
        where: { token },
        relations: ["workspace"],
      });
    } catch (error) {
      console.error("Error in findByToken: ", error);
      throw new Error("Failed to find by token");
    }
  }

  async updateInvitationStatus(
    invitation: WorkspaceInvitation,
    status: "pending" | "accepted" | "expired"
  ): Promise<WorkspaceInvitation> {
    try {
      invitation.status = status;
      return await this.invitationRepo.save(invitation);
    } catch (error) {
      console.error("Error in updateStatus: ", error);
      throw new Error("Failed to update status");
    }
  }

  async findExistingInvitation(
    workspaceId: number,
    email: string
  ): Promise<WorkspaceInvitation | null> {
    try {
      return await this.invitationRepo.findOne({
        where: { workspace_id: workspaceId, email },
      });
    } catch (error) {
      console.error("Error in findExistingInvatation: ", error);
      throw new Error("Failed to find exit invitation");
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
