import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { WorkspaceMember } from "../entities/workspace-member.entity";
import { AuthFailureError, ForbiddenError, InternalServerError } from "../handler/error.response";

/** 
 * This middleware uses RBAC to authorize user actions on workspaces.
 * It checks if the user has the required role in the specified workspace.
 */

export const authorizeWorkspace = (requiredRoles: ("owner" | "admin" | "member" | "viewer")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) throw new AuthFailureError("Unauthorized");

      const userId = user.id;

      // Get workspace_id from:
      // - params
      // - query
      // - body
      const workspaceId =
        req.params.workspace_id ||
        req.query.workspace_id ||
        req.body.workspace_id;

      if (!workspaceId) {
        throw new ForbiddenError("Missing workspace_id in request");
      }

      const memberRepo = AppDataSource.getRepository(WorkspaceMember);

      const membership = await memberRepo.findOne({
        where: {
          user: { id: userId },
          workspace: { id: Number(workspaceId) },
        },
        relations: ["workspace", "user"],
      });

      if (!membership) {
        throw new ForbiddenError("You do not belong to this workspace");
      }

      // Check role
      if (!requiredRoles.includes(membership.role)) {
        throw new ForbiddenError(
          `Workspace permission denied: require [${requiredRoles.join(", ")}], but you are "${membership.role}"`
        );
      }

      next();
    } catch (error) {
      console.error("Workspace RBAC error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError("Internal error during workspace authorization");
    }
  };
};
