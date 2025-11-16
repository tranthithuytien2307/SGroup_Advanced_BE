import { webcrypto } from "crypto";
import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/workspace.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";

class WorkspaceModel {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private memberRepository = AppDataSource.getRepository(WorkspaceMember);

  async getAll() {
    const workspaces = await this.workspaceRepository.find({
      where: { is_delete: false },
      relations: ["boards"], 
      order: { id: "ASC" },
    });

    return workspaces.map((ws) => ({
      ...ws,
      countBoard: ws.boards ? ws.boards.length : 0,
    }));
  }

  // Get all workspaces of a user
  async getAllByUser(userId: number) {
    const workspaces = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.members", "members")
      .leftJoinAndSelect("workspace.boards", "boards")
      .where("members.user_id = :userId", { userId })
      .andWhere("workspace.is_delete = false")
      .orderBy("workspace.id", "ASC")
      .getMany();

    return workspaces.map((ws) => ({
      ...ws,
      countBoard: ws.boards ? ws.boards.length : 0,
    }));
  }

  async getById(id: number) {
    return await this.workspaceRepository.findOne({ 
      where: { id },
      relations: ["owner", "boards", "members", "members.user"], 
    });
  }

  async createWorkspace(name: string, description: string, ownerId: number) {
    const workspace = this.workspaceRepository.create({
      name,
      description,
      owner_id: ownerId,
    });

    const saved = await this.workspaceRepository.save(workspace);

    const member = this.memberRepository.create({
      workspace: { id: saved.id },
      user: { id: ownerId },
      role: "owner",
    });
    await this.memberRepository.save(member);

    return saved;
  }

  async updateWorkspace(
    id: number,
    name: string,
    description: string,
    is_active: boolean,
    userId: number
  ) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ["members","members.user"],
    });
    if (!workspace) throw new Error("Workspace not found");

    const member = workspace.members.find((m) => m.user.id === userId);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      throw new Error("Permission denied");
    }

    workspace.name = name;
    workspace.description = description;
    workspace.is_active = is_active;

    return await this.workspaceRepository.save(workspace);
  }

  async softDelete(id: number, userId: number) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ["members", "members.user"],
    });
    if (!workspace) throw new Error("Workspace not found");

    const member = workspace.members.find((m) => m.user.id === userId);
    if (!member || member.role !== "owner") {
      throw new Error("Permission denied");
    }

    workspace.is_delete = true;
    return await this.workspaceRepository.save(workspace);
  }
}

export default new WorkspaceModel();
