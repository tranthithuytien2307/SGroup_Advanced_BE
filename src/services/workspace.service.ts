import workspaceModel from "../model/workspace.model";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../handler/error.response";

class WorkspaceService {
  async getAll() {
    try {
      const workspaces = await workspaceModel.getAll();
      // Format data: add countBoard
      return workspaces.map((ws) => ({
        ...ws,
        countBoard: ws.boards ? ws.boards.length : 0,
      }));
    } catch (error) {
      throw new InternalServerError("Error fetching workspaces");
    }
  }

  async getAllByUser(userId: number) {
    try {
      const workspaces = await workspaceModel.getAllByUser(userId);
      // Format data: add countBoard
      return workspaces.map((ws) => ({
        ...ws,
        countBoard: ws.boards ? ws.boards.length : 0,
      }));
    } catch (error) {
      throw new InternalServerError("Error fetching workspaces for user");
    }
  }

  async getById(id: number) {
    try {
      const workspace = await workspaceModel.getById(id);
      if (!workspace) {
        throw new NotFoundError("Workspace not found");
      }
      return workspace;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Error fetching workspace");
    }
  }

  async createWorkspace(name: string, description: string, ownerId: number) {
    try {
      // Create workspace
      const workspace = await workspaceModel.createWorkspace(
        name,
        description,
        ownerId
      );

      // Add owner as member with "owner" role
      await workspaceModel.createMember(workspace.id, ownerId, "owner");

      return workspace;
    } catch (error) {
      throw new InternalServerError("Error creating workspace");
    }
  }

  async updateWorkspace(
    id: number,
    name: string,
    description: string,
    is_active: boolean,
    userId: number
  ) {
    try {
      // Validate workspace exists
      const workspace = await workspaceModel.getById(id);
      if (!workspace) {
        throw new NotFoundError("Workspace not found");
      }

      // Validate permission: only owner or admin can update
      const member = workspace.members.find((m) => m.user.id === userId);
      if (!member || (member.role !== "owner" && member.role !== "admin")) {
        throw new ForbiddenError("Permission denied");
      }

      // Apply updates
      workspace.name = name;
      workspace.description = description;
      workspace.is_active = is_active;

      return await workspaceModel.updateWorkspace(workspace);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError("Error updating workspace");
    }
  }

  async deleteWorkspace(id: number, userId: number) {
    try {
      // Validate workspace exists
      const workspace = await workspaceModel.getById(id);
      if (!workspace) {
        throw new NotFoundError("Workspace not found");
      }

      // Validate permission: only owner can delete
      const member = workspace.members.find((m) => m.user.id === userId);
      if (!member || member.role !== "owner") {
        throw new ForbiddenError("Permission denied");
      }

      // Soft delete
      workspace.is_delete = true;
      return await workspaceModel.updateWorkspace(workspace);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new InternalServerError("Error deleting workspace");
    }
  }
}

export default new WorkspaceService();
