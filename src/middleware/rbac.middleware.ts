import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { RolePermission } from "../entities/role-permission.entity";
import { Permission } from "../entities/permission.entity";
import {
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} from "../handler/error.response";

export const authorization = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        throw new AuthFailureError("Unauthorized");
      }

      const roleId = user.role_id;
      if (!roleId) {
        throw new ForbiddenError("Forbidden: No role assigned");
      }

      const RolePermissionRepo = AppDataSource.getRepository(RolePermission);
      const PermissionRepo = AppDataSource.getRepository(Permission);

      const permission = await PermissionRepo.findOne({
        where: { name: requiredPermission },
      });

      if (!permission) {
        throw new ForbiddenError(
          `Forbidden: permission "${requiredPermission}" not found`
        );
      }

      const hasPermission = await RolePermissionRepo.findOne({
        where: {
          role: { id: roleId },
          permission: { id: permission.id },
        },
        relations: ["role", "permission"],
      });

      if (!hasPermission) {
        throw new ForbiddenError(
          `Permission "${requiredPermission}" does not exist`
        );
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);

      if (
        error instanceof AuthFailureError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      throw new InternalServerError(
        "Internal Server Error during authorization"
      );
    }
  };
};
