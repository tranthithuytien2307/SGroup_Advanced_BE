import { Request, Response } from "express";
import UserService from "../services/user.service";
import { ServiceResponse, ResponseStatus } from "../provides/service.response";
import { BadRequestError, NotFoundError } from "../handler/error.response";
import { handleServiceResponse } from "../utils/http-handler";

class UserController {
  static async getUsers(_req: Request, res: Response) {
    const users = await UserService.getAllUsers();
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Users fetched successfully",
        users,
        200
      ),
      res
    );
  }

  static async getUser(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid user id");
    }
    const user = await UserService.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "User fetched successfully",
        user,
        200
      ),
      res
    );
  }

  static async createUser(req: Request, res: Response) {
    const user = await UserService.createUser(req.body);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "User created successfully",
        user,
        201
      ),
      res
    );
  }

  static async updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid user id");
    }
    const user = await UserService.updateUser(id, req.body);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "User updated successfully",
        user,
        200
      ),
      res
    );
  }

  static async deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestError("Invalid user id");
    }
    await UserService.deleteUser(id);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "User deleted successfully",
        null,
        200
      ),
      res
    );
  }

  static async updateProfile(req: Request, res: Response) {
    console.log("eee");
    const userId = Number((req as any).user.id);
    console.log("userId: ", typeof userId);
    if (isNaN(userId))
      throw new BadRequestError("Invalid input: User ID must be a number");
    const updatedUser = await UserService.updateProfile(userId, req.body);
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Profile updated successfully",
        updatedUser,
        200
      ),
      res
    );
  }

  static async uploadAvatar(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const filePath = req.file?.path;
    if (!filePath) {
      return handleServiceResponse(
        new ServiceResponse(ResponseStatus.Failed, "Missing file", null, 400),
        res
      );
    }

    const updatedUser = await UserService.uploadAvatar(userId, filePath);

    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Sucess,
        "Avatar updated successfully",
        updatedUser,
        200
      ),
      res
    );
  }
}

export default UserController;
