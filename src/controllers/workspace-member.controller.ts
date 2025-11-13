import { Request, Response } from "express";
import workspaceMemberService from "../services/workspace-member.service";
import { BadRequestError } from "../handler/error.response";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { handleServiceResponse } from "../utils/http-handler";

class WorkspaceMemberController {
  addMember = async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!workspaceId || !email) {
      throw new BadRequestError("Missing workspaceId or email");
    }

    const newMember = await workspaceMemberService.addMember(
      Number(workspaceId),
      email,
      role || "member"
    );

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Member added successfully",
        newMember,
        201
      ),
      res
    );
  };

  updateRole = async (req: Request, res: Response) => {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    if (!workspaceId || !userId || !role) {
      throw new BadRequestError("Missing workspaceId, userId or role");
    }

    const updatedMember = await workspaceMemberService.updateRole(
      Number(workspaceId),
      Number(userId),
      role
    );

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Member role updated successfully",
        updatedMember,
        200
      ),
      res
    );
  };

  getMembers = async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    if (!workspaceId) {
      throw new BadRequestError("Missing workspaceId");
    }

    const members = await workspaceMemberService.getMembers(
      Number(workspaceId)
    );

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Workspace members retrieved successfully",
        members,
        200
      ),
      res
    );
  };

  removeMember = async (req: Request, res: Response) => {
    const { workspaceId, userId } = req.params;

    if (!workspaceId || !userId) {
      throw new BadRequestError("Missing workspaceId or userId");
    }

    await workspaceMemberService.removeMember(
      Number(workspaceId),
      Number(userId)
    );

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Member removed successfully",
        null,
        200
      ),
      res
    );
  };
}

export default new WorkspaceMemberController();
