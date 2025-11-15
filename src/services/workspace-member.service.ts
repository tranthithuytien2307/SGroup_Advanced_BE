import workspaceMemberModel from "../model/workspace-member.model";
import {
  BadRequestError,
  ErrorResponse,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";
import mailService from "./mail.service";
import crypto from "crypto";

export class WorkspaceMemberService {

  async createInvitation(
    workspaceId: number,
    email: string,
    role: "admin" | "member" | "viewer",
    inviterId: number
  ) {
    try {
      const workspace = await workspaceMemberModel.findWorkspaceById(
        workspaceId
      );
      if (!workspace) throw new NotFoundError("Workspace not found");

      const existingMember = await workspaceMemberModel.findMemberByEmail(
        workspaceId,
        email
      );
      if (existingMember) throw new BadRequestError("User already a member");

      const existingInvite = await workspaceMemberModel.findExistingInvitation(
        workspaceId,
        email
      );
      if (existingInvite) throw new BadRequestError("Invitation already sent");

      const token = crypto.randomUUID();

      const invitation = await workspaceMemberModel.createInvitation(
        email,
        workspace,
        workspaceId,
        "pending",
        token,
        inviterId
      );

      await mailService.sendInvitationEmail(email, token, workspace.name);

      return invitation;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in createInvitation:", error);
      throw new InternalServerError("Failed to create invitation");
    }
  }

  async acceptInvitation(token: string) {
    try {
      const invitation = await workspaceMemberModel.findInvitationByToken(
        token
      );
      if (!invitation) throw new NotFoundError("Invalid or expired invitation");

      if (invitation.status === "accepted")
        throw new BadRequestError("Invitation already accepted");

      let user = await workspaceMemberModel.findUserByEmail(invitation.email);
      if (!user) {
        user = await workspaceMemberModel.createUser(invitation.email);
      }

      const existingMember = await workspaceMemberModel.findMemberByEmail(
        invitation.workspace_id,
        invitation.email
      );

      if (!existingMember) {
        await workspaceMemberModel.createMember(
          invitation.workspace,
          user,
          "member"
        );
      }

      await workspaceMemberModel.updateInvitationStatus(invitation, "accepted");

      return user;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in acceptInvitation:", error);
      throw new InternalServerError("Failed to accept invitation");
    }
  }

  async updateRole(
    workspaceId: number,
    userId: number,
    role: "owner" | "admin" | "member" | "viewer"
  ) {
    try {
      const member = await workspaceMemberModel.findMember(workspaceId, userId);
      if (!member) throw new NotFoundError("Member not found");

      member.role = role;
      await workspaceMemberModel.saveMember(member);

      return member;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in updateRole:", error);
      throw new InternalServerError("Failed to update role");
    }
  }

  async getMembers(workspaceId: number) {
    try {
      const members = await workspaceMemberModel.getMembersByWorkspace(
        workspaceId
      );

      return members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }));
    } catch (error) {
      console.error("Error in getMembers:", error);
      throw new InternalServerError("Failed to fetch workspace members");
    }
  }

  async removeMember(workspaceId: number, userId: number) {
    try {
      const deleted = await workspaceMemberModel.deleteMember(
        workspaceId,
        userId
      );

      if (!deleted)
        throw new NotFoundError("Member not found in this workspace");
      return true;
    } catch (error) {
      if (error instanceof ErrorResponse) throw error;
      console.error("Error in removeMember:", error);
      throw new InternalServerError("Failed to remove member");
    }
  }
}

export default new WorkspaceMemberService();
