import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/workspace.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";
import { Board } from "../entities/board.entity";

class WorkspaceModel {
  private workspaceRepository = AppDataSource.getRepository(Workspace);
  private memberRepository = AppDataSource.getRepository(WorkspaceMember);
  private boardRepository = AppDataSource.getRepository(Board);

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

  async getById(
    id: number,
  ): Promise<(Workspace & { countBoard: number }) | null> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ["owner", "boards", "members", "members.user"],
    });

    if (!workspace) return null;
    return {
      ...workspace,
      countBoard: workspace.boards.length || 0,
    };
  }

  async createWorkspace(
    name: string,
    description: string,
    ownerId: number,
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
    role: "owner" | "admin" | "member" | "viewer",
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
    userId: number,
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

  async getArchivedBoardsByWorkspaceId(workspace_id: number) {
    const result = await this.boardRepository
      .createQueryBuilder("board")
      .leftJoin("board.members", "member")
      .leftJoin("board.lists", "list")
      .where("board.workspace_id = :workspace_id", { workspace_id })
      .andWhere("board.is_archived = :is_archived", { is_archived: true })
      .addSelect("COUNT(DISTINCT member.id)", "memberCount")
      .addSelect("COUNT(DISTINCT list.id)", "listCount")
      .groupBy("board.id")
      .orderBy("board.id", "ASC")
      .getRawAndEntities();

    return result.entities.map((board, index) => ({
      ...board,
      memberCount: Number(result.raw[index].memberCount),
      listCount: Number(result.raw[index].listCount),
    }));
  }

  async archiveWorkspace(workspace_id: number) {
    await this.workspaceRepository.update(
      { id: workspace_id },
      { is_archived: true },
    );

    return { workspace_id, is_archived: true };
  }

  async unarchiveWorkspace(workspace_id: number) {
    await this.workspaceRepository.update(
      { id: workspace_id },
      { is_archived: false },
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspace_id },
      relations: ["owner"],
    });

    if (!workspace) {
      throw new Error("Workspace not found after unarchive");
    }

    return workspace;
  }

  async getArchivedWorkspacesByUser(userId: number) {
    return await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoin("workspace.members", "member")
      .leftJoinAndSelect("workspace.owner", "owner")
      .where("member.user_id = :userId", { userId })
      .andWhere("workspace.is_archived = :is_archived", {
        is_archived: true,
      })
      .andWhere("workspace.is_delete = :is_delete", {
        is_delete: false,
      })
      .orderBy("workspace.id", "ASC")
      .getMany();
  }
}

export default new WorkspaceModel();
