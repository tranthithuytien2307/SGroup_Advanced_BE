import workspaceMemberModel from "../model/workspace-member.model";
import { BadRequestError, NotFoundError } from "../handler/error.response";

export class WorkspaceMemberService {
  async addMember(
    workspaceId: number,
    email: string,
    role: "admin" | "member" | "viewer"
  ) {
    const workspace = await workspaceMemberModel.findWorkspaceById(workspaceId);
    if (!workspace) throw new NotFoundError("Workspace not found");

    const user = await workspaceMemberModel.findUserByEmail(email);
    if (!user) throw new NotFoundError("User not found with this email");

    const existing = await workspaceMemberModel.findMemberByEmail(
      workspaceId,
      email
    );
    if (existing)
      throw new BadRequestError("User already a member of this workspace");

    const newMember = await workspaceMemberModel.createMember(
      workspace,
      user,
      role
    );
    return newMember;
  }

  async updateRole(
    workspaceId: number,
    userId: number,
    role: "owner" | "admin" | "member" | "viewer"
  ) {
    const member = await workspaceMemberModel.findMember(workspaceId, userId);
    if (!member) throw new NotFoundError("Member not found");

    member.role = role;
    await workspaceMemberModel.saveMember(member);
    return member;
  }

  async getMembers(workspaceId: number) {
    const members = await workspaceMemberModel.getMembersByWorkspace(
      workspaceId
    );
    return members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));
  }

  async removeMember(workspaceId: number, userId: number) {
    const deleted = await workspaceMemberModel.deleteMember(
      workspaceId,
      userId
    );
    if (!deleted) throw new NotFoundError("Member not found in this workspace");
    return true;
  }
}

export default new WorkspaceMemberService();
