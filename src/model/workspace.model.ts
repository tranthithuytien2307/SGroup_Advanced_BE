import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/workspace.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";

/**
 * WorkspaceModel - Pure Data Access Layer
 * Only handles database operations, returns data or null
 * No business logic, no validation, no error throwing
 */
class WorkspaceModel {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private memberRepository = AppDataSource.getRepository(WorkspaceMember);

  async getAll() {
    return await this.workspaceRepository.find({
      where: { is_delete: false },
      relations: ["boards"],
      order: { id: "ASC" },
    });
  }

  async getAllByUser(userId: number) {
    return await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.members", "members")
      .leftJoinAndSelect("workspace.boards", "boards")
      .where("members.user_id = :userId", { userId })
      .andWhere("workspace.is_delete = false")
      .orderBy("workspace.id", "ASC")
      .getMany();
  }

  async getById(id: number): Promise<Workspace | null> {
    return await this.workspaceRepository.findOne({
      where: { id },
      relations: ["owner", "boards", "members", "members.user"],
    });
  }

  async createWorkspace(
    name: string,
    description: string,
    ownerId: number
  ): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      name,
      description,
      owner_id: ownerId,
    });
    return await this.workspaceRepository.save(workspace);
  }

  async createMember(
    workspaceId: number,
    userId: number,
    role: "owner" | "admin" | "member" | "viewer"
  ): Promise<WorkspaceMember> {
    const member = this.memberRepository.create({
      workspace: { id: workspaceId },
      user: { id: userId },
      role,
    });
    return await this.memberRepository.save(member);
  }

  async findMemberByUserAndWorkspace(
    workspaceId: number,
    userId: number
  ): Promise<WorkspaceMember | null> {
    return await this.memberRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
      relations: ["user", "workspace"],
    });
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return await this.workspaceRepository.save(workspace);
  }
}

export default new WorkspaceModel();
