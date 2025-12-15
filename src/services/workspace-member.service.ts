import workspaceMemberModel from "../model/workspace-member.model";
import {
  BadRequestError,
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
      // Validate workspace exists
      const workspace = await workspaceMemberModel.findWorkspaceById(workspaceId);
      if (!workspace) {
        throw new NotFoundError("Workspace not found");
      }

      // Check if user is already a member
      const existingMember = await workspaceMemberModel.findMemberByEmail(
        workspaceId,
        email
      );
      if (existingMember) {
        throw new BadRequestError("User already a member");
      }

      // Check if invitation already exists
      const existingInvite = await workspaceMemberModel.findExistingInvitation(
        workspaceId,
        email
      );
      if (existingInvite) {
        throw new BadRequestError("Invitation already sent");
      }

      // Generate token and create invitation
      const token = crypto.randomUUID();
      const invitation = await workspaceMemberModel.createInvitation(
        email,
        workspace,
        workspaceId,
        "pending",
        token,
        inviterId
      );

      // Send invitation email
      await mailService.sendInvitationEmail(email, token, workspace.name);

      return invitation;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      console.error("Error in createInvitation:", error);
      throw new InternalServerError("Failed to create invitation");
    }
  }

  async acceptInvitation(token: string) {
    try {
      // Validate invitation exists and is valid
      const invitation = await workspaceMemberModel.findInvitationByToken(token);
      if (!invitation) {
        throw new NotFoundError("Invalid or expired invitation");
      }

      if (invitation.status === "accepted") {
        throw new BadRequestError("Invitation already accepted");
      }

      // Find or create user
      let user = await workspaceMemberModel.findUserByEmail(invitation.email);
      if (!user) {
        user = await workspaceMemberModel.createUser(invitation.email);
      }

      // Check if already a member, if not create membership
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

      // Update invitation status
      await workspaceMemberModel.updateInvitationStatus(invitation, "accepted");

      return user;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
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
      // Validate member exists
      const member = await workspaceMemberModel.findMember(workspaceId, userId);
      if (!member) {
        throw new NotFoundError("Member not found");
      }

      // Update role
      member.role = role;
      await workspaceMemberModel.saveMember(member);

      return member;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in updateRole:", error);
      throw new InternalServerError("Failed to update role");
    }
  }

  async getMembers(workspaceId: number) {
    try {
      const members = await workspaceMemberModel.getMembersByWorkspace(workspaceId);

      // Format response
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
      // Validate member exists
      const member = await workspaceMemberModel.findMember(workspaceId, userId);
      if (!member) {
        throw new NotFoundError("Member not found in this workspace");
      }

      // Delete member
      await workspaceMemberModel.deleteMember(member);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in removeMember:", error);
      throw new InternalServerError("Failed to remove member");
    }
  }
}

export default new WorkspaceMemberService();
