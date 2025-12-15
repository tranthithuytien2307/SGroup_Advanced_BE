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
    return await this.workspaceRepo.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { email } });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }

  async isUserMember(
    workspaceId: number,
    userId: number
  ): Promise<boolean> {
    const member = await this.memberRepo.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
    });
    return !!member;
  }

  async findMember(
    workspaceId: number,
    userId: number
  ): Promise<WorkspaceMember | null> {
    return await this.memberRepo.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
      relations: ["user", "workspace"],
    });
  }

  async createUser(email: string, name?: string): Promise<User> {
    const user = this.userRepo.create({
      email,
      name: name || email.split("@")[0],
      password: null,
    });
    return await this.userRepo.save(user);
  }

  async findMemberByEmail(
    workspaceId: number,
    email: string
  ): Promise<WorkspaceMember | null> {
    return await this.memberRepo.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { email },
      },
      relations: ["user"],
    });
  }

  async createInvitation(
    email: string,
    workspace: Workspace,
    workspace_id: number,
    status: "pending" | "accepted" | "expired",
    token: string,
    invited_by_id: number
  ): Promise<WorkspaceInvitation> {
    const invitation = this.invitationRepo.create({
      email,
      workspace,
      workspace_id,
      status,
      token,
      invited_by_id,
    });
    return await this.invitationRepo.save(invitation);
  }

  async findInvitationByToken(
    token: string
  ): Promise<WorkspaceInvitation | null> {
    return await this.invitationRepo.findOne({
      where: { token },
      relations: ["workspace"],
    });
  }

  async updateInvitationStatus(
    invitation: WorkspaceInvitation,
    status: "pending" | "accepted" | "expired"
  ): Promise<WorkspaceInvitation> {
    invitation.status = status;
    return await this.invitationRepo.save(invitation);
  }

  async findExistingInvitation(
    workspaceId: number,
    email: string
  ): Promise<WorkspaceInvitation | null> {
    return await this.invitationRepo.findOne({
      where: { workspace_id: workspaceId, email },
    });
  }

  async createMember(
    workspace: Workspace,
    user: User,
    role: "owner" | "admin" | "member" | "viewer" = "member"
  ): Promise<WorkspaceMember> {
    const newMember = this.memberRepo.create({
      workspace,
      user,
      role,
    });
    return await this.memberRepo.save(newMember);
  }

  async getMembersByWorkspace(workspaceId: number): Promise<WorkspaceMember[]> {
    return await this.memberRepo.find({
      where: { workspace: { id: workspaceId } },
      relations: ["user"],
    });
  }

  async saveMember(member: WorkspaceMember): Promise<WorkspaceMember> {
    return await this.memberRepo.save(member);
  }

  async deleteMember(member: WorkspaceMember): Promise<void> {
    await this.memberRepo.remove(member);
  }
}

export default new WorkspaceMemberModel();
