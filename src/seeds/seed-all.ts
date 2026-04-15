import "reflect-metadata";
import * as bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { DeepPartial } from "typeorm";

// Entities
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";
import { User } from "../entities/user.entity";
import { Workspace } from "../entities/workspace.entity";
import { WorkspaceMember } from "../entities/workspace-member.entity";
import { Board } from "../entities/board.entity";
import { BoardMember } from "../entities/board-member.entity";
import { List } from "../entities/list.entity";
import { Card } from "../entities/card.entity";
import { Label } from "../entities/label.entity";
import { Checklist } from "../entities/checklist.entity";
import { ChecklistItem } from "../entities/checklist-item.entity";
import { Comment } from "../entities/comment.entity";
import { CardMember } from "../entities/card-member.entity";
import { Attachment } from "../entities/attachment.entity";
import { TemplateBoard } from "../entities/template-board.entity";
import { TemplateList } from "../entities/template-list.entity";
import { TemplateCard } from "../entities/template-card.entity";

// ─────────────────────────────────────────────────────
// Helper: upsert one record (find by uniqueField or insert)
// ─────────────────────────────────────────────────────
async function upsert<T extends object>(
  repo: any,
  data: Partial<T>,
  findBy: Partial<T>
): Promise<T> {
  let rec = await repo.findOne({ where: findBy });
  if (!rec) {
    rec = repo.create(data);
    await repo.save(rec);
  }
  return rec;
}

async function syncIdSequences() {
  for (const metadata of AppDataSource.entityMetadatas) {
    if (metadata.primaryColumns.length !== 1) continue;

    const primaryColumn = metadata.primaryColumns[0];
    if (primaryColumn.databaseName !== "id") continue;
    if (primaryColumn.generationStrategy !== "increment") continue;

    await AppDataSource.query(
      `SELECT setval(pg_get_serial_sequence('${metadata.tableName}', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM "${metadata.tableName}"`,
    );
  }
}

export const seedAll = async () => {
  await AppDataSource.initialize();
  await syncIdSequences();
  console.log("✅ DB connected — seeding...\n");

  // ═══════════════════════════════════════════════════
  // 1. ROLES
  // ═══════════════════════════════════════════════════
  console.log("── Seeding Roles ──");
  const roleRepo = AppDataSource.getRepository(Role);
  const rolesData = [
    { name: "admin", description: "System Administrator" },
    { name: "staff", description: "Staff / Manager" },
    { name: "user", description: "General user" },
  ];
  const roles: Record<string, Role> = {};
  for (const r of rolesData) {
    const savedRole = await upsert(roleRepo, r, { name: r.name } as any);
    roles[r.name] = savedRole as any;
    console.log(`  Role: ${r.name}`);
  }

  // ═══════════════════════════════════════════════════
  // 2. PERMISSIONS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Permissions ──");
  const permRepo = AppDataSource.getRepository(Permission);
  const permissionsData = [
    { name: "create_user" },
    { name: "delete_user" },
    { name: "update_user" },
    { name: "update_self" },
    { name: "view_all" },
    { name: "view_self" },
  ];
  const perms: Record<string, Permission> = {};
  for (const p of permissionsData) {
    const savedPerm = await upsert(permRepo, p, { name: p.name } as any);
    perms[p.name] = savedPerm as any;
    console.log(`  Permission: ${p.name}`);
  }

  // ═══════════════════════════════════════════════════
  // 3. ROLE-PERMISSION MAPPING
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Role-Permission Mappings ──");
  const rolePermRepo = AppDataSource.getRepository(RolePermission);
  const rolePermMap: Record<string, string[]> = {
    admin: ["create_user", "delete_user", "update_user", "update_self", "view_all", "view_self"],
    staff: ["update_user", "update_self", "view_all", "view_self"],
    user: ["update_self", "view_self"],
  };
  for (const [roleName, permNames] of Object.entries(rolePermMap)) {
    for (const permName of permNames) {
      const exists = await rolePermRepo.findOne({
        where: { role: { id: roles[roleName].id }, permission: { id: perms[permName].id } },
      });
      if (!exists) {
        await rolePermRepo.save({ role: roles[roleName], permission: perms[permName] });
      }
      console.log(`  ${roleName} → ${permName}`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 4. USERS  (user id:1 assumed already exists; we
  //    insert it too for safety, with skip-if-exists)
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Users ──");
  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const usersData = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@sgroup.dev",
      password: passwordHash,
      role_id: roles["admin"].id,
      isVerified: true,
      bio: "System administrator",
    },
    {
      id: 2,
      name: "Alice Nguyen",
      email: "alice@sgroup.dev",
      password: passwordHash,
      role_id: roles["user"].id,
      isVerified: true,
      bio: "Frontend developer",
    },
    {
      id: 3,
      name: "Bob Tran",
      email: "bob@sgroup.dev",
      password: passwordHash,
      role_id: roles["user"].id,
      isVerified: true,
      bio: "Backend developer",
    },
    {
      id: 4,
      name: "Khoi Ben",
      email: "khoibene@gmail.com",
      password: passwordHash,
      role_id: roles["user"].id,
      isVerified: true,
      bio: "Workspace owner and board collaborator",
    },
  ];
  const users: Record<number, User> = {};
  for (const u of usersData) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      user = userRepo.create(u);
      await userRepo.save(user);
      console.log(`  Created user: ${u.email}`);
    } else {
      console.log(`  Skipped (exists): ${u.email}`);
    }
    users[u.id] = user;
  }

  // ═══════════════════════════════════════════════════
  // 5. WORKSPACES
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Workspaces ──");
  const wsRepo = AppDataSource.getRepository(Workspace);
  const workspacesData = [
    {
      name: "SGroup Dev",
      description: "Main development workspace",
      owner_id: 1,
      visibility: "workspace" as const,
    },
    {
      name: "Design Team",
      description: "UI/UX design workspace",
      owner_id: 1,
      visibility: "private" as const,
    },
    {
      name: "Khoi Product Lab",
      description: "Workspace for product planning between Khoi and admin",
      owner_id: 4,
      visibility: "workspace" as const,
    },
    {
      name: "SGroup Ops Hub",
      description: "Shared workspace for operations and releases",
      owner_id: 1,
      visibility: "workspace" as const,
    },
    {
      name: "Client Success Desk",
      description: "Workspace to coordinate client onboarding tasks",
      owner_id: 4,
      visibility: "private" as const,
    },
  ];
  const workspaces: Workspace[] = [];
  for (const w of workspacesData) {
    let ws = await wsRepo.findOne({ where: { name: w.name, owner_id: w.owner_id } });
    if (!ws) {
      ws = wsRepo.create(w);
      await wsRepo.save(ws);
      console.log(`  Created workspace: ${w.name}`);
    } else {
      console.log(`  Skipped (exists): ${w.name}`);
    }
    workspaces.push(ws);
  }

  // ═══════════════════════════════════════════════════
  // 6. WORKSPACE MEMBERS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Workspace Members ──");
  const wsMemberRepo = AppDataSource.getRepository(WorkspaceMember);
  const wsMembersData = [
    { user_id: 1, workspace: workspaces[0], role: "owner" as const },
    { user_id: 2, workspace: workspaces[0], role: "member" as const },
    { user_id: 3, workspace: workspaces[0], role: "member" as const },
    { user_id: 1, workspace: workspaces[1], role: "owner" as const },
    { user_id: 2, workspace: workspaces[1], role: "admin" as const },
    { user_id: 4, workspace: workspaces[2], role: "owner" as const },
    { user_id: 1, workspace: workspaces[2], role: "admin" as const },
    { user_id: 1, workspace: workspaces[3], role: "owner" as const },
    { user_id: 4, workspace: workspaces[3], role: "member" as const },
    { user_id: 4, workspace: workspaces[4], role: "owner" as const },
    { user_id: 1, workspace: workspaces[4], role: "viewer" as const },
  ];
  for (const m of wsMembersData) {
    const exists = await wsMemberRepo.findOne({
      where: { user: { id: m.user_id }, workspace: { id: m.workspace.id } },
    });
    if (!exists) {
      await wsMemberRepo.save(wsMemberRepo.create({
        user: { id: m.user_id } as User,
        workspace: m.workspace,
        role: m.role,
      }));
      console.log(`  User ${m.user_id} → workspace "${m.workspace.name}" [${m.role}]`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 7. BOARDS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Boards ──");
  const boardRepo = AppDataSource.getRepository(Board);
  const boardsData = [
    {
      name: "Product Roadmap",
      description: "Track product features and milestones",
      workspace_id: workspaces[0].id,
      created_by_id: 1,
      visibility: "workspace" as const,
      theme: "#4F46E5",
    },
    {
      name: "Sprint Board",
      description: "Current sprint tasks",
      workspace_id: workspaces[0].id,
      created_by_id: 1,
      visibility: "workspace" as const,
      theme: "#059669",
    },
    {
      name: "Bug Tracker",
      description: "Track and resolve bugs",
      workspace_id: workspaces[0].id,
      created_by_id: 1,
      visibility: "private" as const,
      theme: "#DC2626",
    },
    {
      name: "UI Components",
      description: "Design system components",
      workspace_id: workspaces[1].id,
      created_by_id: 1,
      visibility: "workspace" as const,
      theme: "#7C3AED",
    },
    {
      name: "Khoi Launch Plan",
      description: "Launch checklist and milestones for Khoi's workspace",
      workspace_id: workspaces[2].id,
      created_by_id: 4,
      visibility: "workspace" as const,
      theme: "#2563EB",
    },
    {
      name: "Ops Release Calendar",
      description: "Track release windows and operational handoffs",
      workspace_id: workspaces[3].id,
      created_by_id: 1,
      visibility: "workspace" as const,
      theme: "#EA580C",
    },
    {
      name: "Client Onboarding Board",
      description: "Tasks for onboarding new client accounts",
      workspace_id: workspaces[4].id,
      created_by_id: 4,
      visibility: "private" as const,
      theme: "#0F766E",
    },
  ];
  const boards: Board[] = [];
  for (const b of boardsData) {
    let board = await boardRepo.findOne({
      where: { name: b.name, workspace_id: b.workspace_id },
    });
    if (!board) {
      board = boardRepo.create(b);
      await boardRepo.save(board);
      console.log(`  Created board: ${b.name}`);
    } else {
      console.log(`  Skipped (exists): ${b.name}`);
    }
    boards.push(board);
  }

  // ═══════════════════════════════════════════════════
  // 8. BOARD MEMBERS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Board Members ──");
  const boardMemberRepo = AppDataSource.getRepository(BoardMember);
  const boardMembersData = [
    { user_id: 1, board: boards[0], role: "admin" as const },
    { user_id: 2, board: boards[0], role: "member" as const },
    { user_id: 3, board: boards[0], role: "member" as const },
    { user_id: 1, board: boards[1], role: "admin" as const },
    { user_id: 2, board: boards[1], role: "member" as const },
    { user_id: 1, board: boards[2], role: "admin" as const },
    { user_id: 1, board: boards[3], role: "admin" as const },
    { user_id: 2, board: boards[3], role: "admin" as const },
    { user_id: 4, board: boards[4], role: "admin" as const },
    { user_id: 1, board: boards[4], role: "member" as const },
    { user_id: 1, board: boards[5], role: "admin" as const },
    { user_id: 4, board: boards[5], role: "member" as const },
    { user_id: 4, board: boards[6], role: "admin" as const },
    { user_id: 1, board: boards[6], role: "viewer" as const },
  ];
  for (const m of boardMembersData) {
    const exists = await boardMemberRepo.findOne({
      where: { user: { id: m.user_id }, board: { id: m.board.id } },
    });
    if (!exists) {
      await boardMemberRepo.save(boardMemberRepo.create({
        user: { id: m.user_id } as User,
        board: m.board,
        role: m.role,
      }));
      console.log(`  User ${m.user_id} → board "${m.board.name}" [${m.role}]`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 9. LISTS (board_lists)
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Lists ──");
  const listRepo = AppDataSource.getRepository(List);

  // board 0 — Product Roadmap
  const listsBoard0 = [
    { board_id: boards[0].id, name: "Backlog", position: 1 },
    { board_id: boards[0].id, name: "In Progress", position: 2 },
    { board_id: boards[0].id, name: "Review", position: 3 },
    { board_id: boards[0].id, name: "Done", position: 4 },
  ];
  // board 1 — Sprint Board
  const listsBoard1 = [
    { board_id: boards[1].id, name: "To Do", position: 1 },
    { board_id: boards[1].id, name: "In Progress", position: 2 },
    { board_id: boards[1].id, name: "Done", position: 3 },
  ];
  // board 2 — Bug Tracker
  const listsBoard2 = [
    { board_id: boards[2].id, name: "Reported", position: 1 },
    { board_id: boards[2].id, name: "Confirmed", position: 2 },
    { board_id: boards[2].id, name: "Fixed", position: 3 },
    { board_id: boards[2].id, name: "Closed", position: 4 },
  ];
  // board 3 — UI Components
  const listsBoard3 = [
    { board_id: boards[3].id, name: "Design", position: 1 },
    { board_id: boards[3].id, name: "Development", position: 2 },
    { board_id: boards[3].id, name: "Review", position: 3 },
  ];

  const allListsData = [
    ...listsBoard0,
    ...listsBoard1,
    ...listsBoard2,
    ...listsBoard3,
  ];
  const lists: List[] = [];
  for (const l of allListsData) {
    let list = await listRepo.findOne({ where: { board_id: l.board_id, name: l.name } });
    if (!list) {
      list = listRepo.create(l);
      await listRepo.save(list);
      console.log(`  Created list: "${l.name}" (board ${l.board_id})`);
    } else {
      console.log(`  Skipped (exists): "${l.name}"`);
    }
    lists.push(list);
  }

  // ═══════════════════════════════════════════════════
  // 10. LABELS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Labels ──");
  const labelRepo = AppDataSource.getRepository(Label);
  const labelsData = [
    { name: "Feature", color: "#4F46E5", board_id: boards[0].id },
    { name: "Bug", color: "#DC2626", board_id: boards[0].id },
    { name: "Enhancement", color: "#059669", board_id: boards[0].id },
    { name: "High Priority", color: "#EA580C", board_id: boards[1].id },
    { name: "Low Priority", color: "#6B7280", board_id: boards[1].id },
    { name: "Critical", color: "#B91C1C", board_id: boards[2].id },
    { name: "Minor", color: "#D97706", board_id: boards[2].id },
  ];
  const labels: Label[] = [];
  for (const lb of labelsData) {
    let label = await labelRepo.findOne({ where: { name: lb.name, board_id: lb.board_id } });
    if (!label) {
      label = labelRepo.create(lb);
      await labelRepo.save(label);
      console.log(`  Label: "${lb.name}"`);
    }
    labels.push(label);
  }

  // ═══════════════════════════════════════════════════
  // 11. CARDS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Cards ──");
  const cardRepo = AppDataSource.getRepository(Card);

  // lists[0]=Backlog, lists[1]=In Progress, lists[2]=Review, lists[3]=Done (board 0)
  // lists[4]=To Do, lists[5]=In Progress, lists[6]=Done (board 1)
  // lists[7]=Reported, lists[8]=Confirmed, lists[9]=Fixed, lists[10]=Closed (board 2)
  // lists[11]=Design, lists[12]=Development, lists[13]=Review (board 3)

  const cardsData = [
    // Product Roadmap — Backlog
    {
      list_id: lists[0].id,
      title: "User authentication flow",
      description: "Design and implement full auth flow including OAuth",
      position: 1,
    },
    {
      list_id: lists[0].id,
      title: "Notification system",
      description: "Real-time push notifications",
      position: 2,
    },
    {
      list_id: lists[0].id,
      title: "Dark mode support",
      description: "Implement system-wide dark mode toggle",
      position: 3,
    },
    // Product Roadmap — In Progress
    {
      list_id: lists[1].id,
      title: "Template feature",
      description: "Board template selection and cloning",
      position: 1,
    },
    {
      list_id: lists[1].id,
      title: "Search & filter",
      description: "Global search across boards and cards",
      position: 2,
    },
    // Product Roadmap — Review
    {
      list_id: lists[2].id,
      title: "Profile page redesign",
      description: "Updated user profile UI",
      position: 1,
    },
    // Product Roadmap — Done
    {
      list_id: lists[3].id,
      title: "Project setup",
      description: "Initial project scaffolding and CI/CD",
      position: 1,
    },

    // Sprint Board — To Do
    {
      list_id: lists[4].id,
      title: "Fix card drag & drop on mobile",
      description: "Touch events not firing correctly",
      position: 1,
    },
    {
      list_id: lists[4].id,
      title: "Add due date to cards",
      description: "Date picker in card detail modal",
      position: 2,
    },
    // Sprint Board — In Progress
    {
      list_id: lists[5].id,
      title: "Implement comment feature",
      description: "Allow users to comment on cards",
      position: 1,
    },
    // Sprint Board — Done
    {
      list_id: lists[6].id,
      title: "Board invitation via email",
      description: "Send email invite link with token",
      position: 1,
    },

    // Bug Tracker — Reported
    {
      list_id: lists[7].id,
      title: "Login redirect fails on Safari",
      description: "After OAuth the callback URL is malformed on Safari",
      position: 1,
    },
    {
      list_id: lists[7].id,
      title: "Workspace list shows archived boards",
      description: "Archived boards should be hidden in main list",
      position: 2,
    },
    // Bug Tracker — Confirmed
    {
      list_id: lists[8].id,
      title: "Card position resets on refresh",
      description: "Drag-and-drop position not persisted",
      position: 1,
    },
    // Bug Tracker — Fixed
    {
      list_id: lists[9].id,
      title: "404 on board page after archive",
      description: "Board page should redirect to dashboard",
      position: 1,
    },

    // UI Components — Design
    {
      list_id: lists[11].id,
      title: "Button variants",
      description: "Primary, secondary, outline, ghost variants",
      position: 1,
    },
    {
      list_id: lists[11].id,
      title: "Color palette tokens",
      description: "Define all design tokens in CSS variables",
      position: 2,
    },
    // UI Components — Development
    {
      list_id: lists[12].id,
      title: "Card component",
      description: "Reusable card with slots for header/body/footer",
      position: 1,
    },
    // UI Components — Review
    {
      list_id: lists[13].id,
      title: "Modal/Dialog component",
      description: "Accessible dialog with focus trap",
      position: 1,
    },
  ];

  const cards: Card[] = [];
  for (const c of cardsData) {
    let card = await cardRepo.findOne({ where: { list_id: c.list_id, title: c.title } });
    if (!card) {
      card = cardRepo.create(c);
      await cardRepo.save(card);
      console.log(`  Created card: "${c.title}"`);
    } else {
      console.log(`  Skipped (exists): "${c.title}"`);
    }
    cards.push(card);
  }

  // ═══════════════════════════════════════════════════
  // 12. CARD LABELS (many-to-many via card_labels join)
  // ═══════════════════════════════════════════════════
  console.log("\n── Assigning Labels to Cards ──");
  // Reload cards with relations to attach labels safely
  const card0Full = await cardRepo.findOne({ where: { id: cards[0].id }, relations: ["labels"] });
  const card1Full = await cardRepo.findOne({ where: { id: cards[3].id }, relations: ["labels"] });
  if (card0Full && !card0Full.labels.some(l => l.id === labels[0].id)) {
    card0Full.labels = [...(card0Full.labels || []), labels[0], labels[2]];
    await cardRepo.save(card0Full);
    console.log(`  Labels assigned to "${card0Full.title}"`);
  }
  if (card1Full && !card1Full.labels.some(l => l.id === labels[0].id)) {
    card1Full.labels = [...(card1Full.labels || []), labels[0]];
    await cardRepo.save(card1Full);
    console.log(`  Labels assigned to "${card1Full.title}"`);
  }

  // ═══════════════════════════════════════════════════
  // 13. CHECKLISTS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Checklists ──");
  const checklistRepo = AppDataSource.getRepository(Checklist);
  const checklistsData = [
    { card_id: cards[0].id, title: "Auth Subtasks" },
    { card_id: cards[3].id, title: "Template Implementation" },
    { card_id: cards[17].id, title: "Component Checklist" },
  ];
  const checklists: Checklist[] = [];
  for (const ch of checklistsData) {
    let cl = await checklistRepo.findOne({ where: { card_id: ch.card_id, title: ch.title } });
    if (!cl) {
      cl = checklistRepo.create(ch);
      await checklistRepo.save(cl);
      console.log(`  Checklist: "${ch.title}"`);
    }
    checklists.push(cl);
  }

  // ═══════════════════════════════════════════════════
  // 14. CHECKLIST ITEMS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Checklist Items ──");
  const checklistItemRepo = AppDataSource.getRepository(ChecklistItem);
  const itemsData = [
    // checklist 0 — Auth Subtasks
    { checklist_id: checklists[0].id, content: "Design login/register UI", is_completed: true },
    { checklist_id: checklists[0].id, content: "Integrate Google OAuth", is_completed: true },
    { checklist_id: checklists[0].id, content: "Add email verification", is_completed: false },
    { checklist_id: checklists[0].id, content: "Write unit tests for auth", is_completed: false },
    // checklist 1 — Template Implementation
    { checklist_id: checklists[1].id, content: "Create entity models", is_completed: true },
    { checklist_id: checklists[1].id, content: "Build API endpoints", is_completed: true },
    { checklist_id: checklists[1].id, content: "Implement frontend UI", is_completed: false },
    // checklist 2 — Component Checklist
    { checklist_id: checklists[2].id, content: "Define props interface", is_completed: true },
    { checklist_id: checklists[2].id, content: "Write Storybook stories", is_completed: false },
    { checklist_id: checklists[2].id, content: "Add accessibility tests", is_completed: false },
  ];
  for (const item of itemsData) {
    const exists = await checklistItemRepo.findOne({
      where: { checklist_id: item.checklist_id, content: item.content },
    });
    if (!exists) {
      await checklistItemRepo.save(checklistItemRepo.create(item));
      console.log(`  Item: "${item.content}"`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 15. COMMENTS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Comments ──");
  const commentRepo = AppDataSource.getRepository(Comment);
  const commentsData = [
    { card_id: cards[0].id, user_id: 1, content: "OAuth integration is done. Moving to email verification." },
    { card_id: cards[0].id, user_id: 2, content: "Should we support GitHub OAuth too?" },
    { card_id: cards[3].id, user_id: 1, content: "BE API is ready. FE implementation in progress." },
    { card_id: cards[9].id, user_id: 2, content: "Comment API endpoint wired up successfully." },
    { card_id: cards[11].id, user_id: 3, content: "Reproduced on Safari 17. Will investigate." },
  ];
  for (const c of commentsData) {
    const exists = await commentRepo.findOne({
      where: { card_id: c.card_id, user_id: c.user_id, content: c.content },
    });
    if (!exists) {
      await commentRepo.save(commentRepo.create(c));
      console.log(`  Comment on card ${c.card_id}`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 16. CARD MEMBERS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Card Members ──");
  const cardMemberRepo = AppDataSource.getRepository(CardMember);
  const cardMembersData = [
    { card_id: cards[0].id, user_id: 1 },
    { card_id: cards[0].id, user_id: 2 },
    { card_id: cards[3].id, user_id: 1 },
    { card_id: cards[9].id, user_id: 2 },
    { card_id: cards[11].id, user_id: 3 },
  ];
  for (const m of cardMembersData) {
    const exists = await cardMemberRepo.findOne({
      where: { card_id: m.card_id, user_id: m.user_id },
    });
    if (!exists) {
      await cardMemberRepo.save(cardMemberRepo.create(m));
      console.log(`  User ${m.user_id} → card ${m.card_id}`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 17. ATTACHMENTS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Attachments ──");
  const attachmentRepo = AppDataSource.getRepository(Attachment);
  const attachmentsData = [
    {
      card_id: cards[0].id,
      file_name: "auth-flow-diagram.png",
      file_url: "https://placehold.co/800x600?text=Auth+Flow",
      file_type: "image/png",
      is_cover: true,
    },
    {
      card_id: cards[3].id,
      file_name: "template-wireframe.pdf",
      file_url: "https://placehold.co/800x600?text=Template+Wireframe",
      file_type: "application/pdf",
      is_cover: false,
    },
  ];
  for (const a of attachmentsData) {
    const exists = await attachmentRepo.findOne({
      where: { card_id: a.card_id, file_name: a.file_name },
    });
    if (!exists) {
      await attachmentRepo.save(attachmentRepo.create(a));
      console.log(`  Attachment: "${a.file_name}"`);
    }
  }

  // ═══════════════════════════════════════════════════
  // 18. TEMPLATES (board_templates)
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Templates ──");
  const templateRepo = AppDataSource.getRepository(TemplateBoard);
  const templatesData = [
    {
      name: "Kanban Board",
      description: "Classic Kanban with To Do, In Progress, and Done columns. Perfect for agile teams.",
      created_by_id: 1,
      owner: { id: 1 } as User,
      theme: "#4F46E5",
      is_archived: false,
    },
    {
      name: "Project Roadmap",
      description: "Plan your product roadmap with Backlog, In Progress, Review, and Done stages.",
      created_by_id: 1,
      owner: { id: 1 } as User,
      theme: "#059669",
      is_archived: false,
    },
    {
      name: "Bug Tracker",
      description: "Track software bugs from Reported through Confirmed, Fixed, and Closed.",
      created_by_id: 1,
      owner: { id: 1 } as User,
      theme: "#DC2626",
      is_archived: false,
    },
    {
      name: "Sprint Planning",
      description: "Organize your team sprints with Planning, In Progress, Testing, and Released.",
      created_by_id: 1,
      owner: { id: 1 } as User,
      theme: "#D97706",
      is_archived: false,
    },
    {
      name: "Marketing Campaign",
      description: "Manage marketing campaigns from Ideation through Launch and Analysis.",
      created_by_id: 1,
      owner: { id: 1 } as User,
      theme: "#7C3AED",
      is_archived: false,
    },
    {
      name: "OKRs Tracker",
      description: "Track Objectives and Key Results per quarter.",
      created_by_id: 1,
      owner: { id: 1 } as User,
      theme: "#0891B2",
      is_archived: false,
    },
  ];
  const templates: TemplateBoard[] = [];
  for (const t of templatesData) {
    let tpl = await templateRepo.findOne({ where: { name: t.name, created_by_id: t.created_by_id } });
    if (!tpl) {
      tpl = templateRepo.create(t);
      await templateRepo.save(tpl);
      console.log(`  Template: "${t.name}"`);
    } else {
      console.log(`  Skipped (exists): "${t.name}"`);
    }
    templates.push(tpl);
  }

  // ═══════════════════════════════════════════════════
  // 19. TEMPLATE LISTS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Template Lists ──");
  const templateListRepo = AppDataSource.getRepository(TemplateList);
  const templateListsData: { template_id: number; name: string; position: number }[] = [
    // Kanban
    { template_id: templates[0].id, name: "To Do", position: 1 },
    { template_id: templates[0].id, name: "In Progress", position: 2 },
    { template_id: templates[0].id, name: "Done", position: 3 },
    // Project Roadmap
    { template_id: templates[1].id, name: "Backlog", position: 1 },
    { template_id: templates[1].id, name: "In Progress", position: 2 },
    { template_id: templates[1].id, name: "Review", position: 3 },
    { template_id: templates[1].id, name: "Done", position: 4 },
    // Bug Tracker
    { template_id: templates[2].id, name: "Reported", position: 1 },
    { template_id: templates[2].id, name: "Confirmed", position: 2 },
    { template_id: templates[2].id, name: "Fixed", position: 3 },
    { template_id: templates[2].id, name: "Closed", position: 4 },
    // Sprint Planning
    { template_id: templates[3].id, name: "Sprint Planning", position: 1 },
    { template_id: templates[3].id, name: "In Progress", position: 2 },
    { template_id: templates[3].id, name: "Testing", position: 3 },
    { template_id: templates[3].id, name: "Released", position: 4 },
    // Marketing Campaign
    { template_id: templates[4].id, name: "Ideation", position: 1 },
    { template_id: templates[4].id, name: "Content Creation", position: 2 },
    { template_id: templates[4].id, name: "Approval", position: 3 },
    { template_id: templates[4].id, name: "Launched", position: 4 },
    { template_id: templates[4].id, name: "Analysis", position: 5 },
    // OKRs Tracker
    { template_id: templates[5].id, name: "Objectives", position: 1 },
    { template_id: templates[5].id, name: "Key Results", position: 2 },
    { template_id: templates[5].id, name: "On Track", position: 3 },
    { template_id: templates[5].id, name: "At Risk", position: 4 },
    { template_id: templates[5].id, name: "Achieved", position: 5 },
  ];
  const templateLists: TemplateList[] = [];
  for (const tl of templateListsData) {
    let list = await templateListRepo.findOne({
      where: { template_id: tl.template_id, name: tl.name },
    });
    if (!list) {
      list = templateListRepo.create(tl);
      await templateListRepo.save(list);
      console.log(`  Template list: "${tl.name}" (template ${tl.template_id})`);
    }
    templateLists.push(list);
  }

  // ═══════════════════════════════════════════════════
  // 20. TEMPLATE CARDS
  // ═══════════════════════════════════════════════════
  console.log("\n── Seeding Template Cards ──");
  const templateCardRepo = AppDataSource.getRepository(TemplateCard);

  // Map template list names to indices
  // [0-2]=Kanban, [3-6]=Roadmap, [7-10]=BugTracker,
  // [11-14]=Sprint, [15-19]=Marketing, [20-24]=OKRs
  const templateCardsData = [
    // Kanban — To Do (idx 0)
    { list_id: templateLists[0].id, title: "Example task 1", description: "Replace with your task" },
    { list_id: templateLists[0].id, title: "Example task 2", description: null },
    // Kanban — In Progress (idx 1)
    { list_id: templateLists[1].id, title: "Current task in progress", description: null },
    // Kanban — Done (idx 2)
    { list_id: templateLists[2].id, title: "Completed task", description: null },

    // Roadmap — Backlog (idx 3)
    { list_id: templateLists[3].id, title: "Feature idea", description: "Describe your feature" },
    { list_id: templateLists[3].id, title: "Technical debt item", description: null },
    // Roadmap — In Progress (idx 4)
    { list_id: templateLists[4].id, title: "Active development", description: null },
    // Roadmap — Done (idx 6)
    { list_id: templateLists[6].id, title: "Shipped feature", description: null },

    // Bug Tracker — Reported (idx 7)
    { list_id: templateLists[7].id, title: "New bug report", description: "Steps to reproduce: ..." },
    // Bug Tracker — Confirmed (idx 8)
    { list_id: templateLists[8].id, title: "Confirmed critical bug", description: null },
    // Bug Tracker — Fixed (idx 9)
    { list_id: templateLists[9].id, title: "Fixed and tested", description: null },

    // Sprint — Sprint Planning (idx 11)
    { list_id: templateLists[11].id, title: "Sprint goal", description: "Define the sprint goal here" },
    // Sprint — In Progress (idx 12)
    { list_id: templateLists[12].id, title: "User story: login", description: null },
    // Sprint — Released (idx 14)
    { list_id: templateLists[14].id, title: "Released to production", description: null },

    // Marketing — Ideation (idx 15)
    { list_id: templateLists[15].id, title: "Campaign idea", description: "Describe the campaign concept" },
    // Marketing — Content Creation (idx 16)
    { list_id: templateLists[16].id, title: "Blog post draft", description: null },
    // Marketing — Launched (idx 18)
    { list_id: templateLists[18].id, title: "Campaign launched", description: null },

    // OKRs — Objectives (idx 20)
    { list_id: templateLists[20].id, title: "Q1 Objective", description: "Describe your objective" },
    // OKRs — Key Results (idx 21)
    { list_id: templateLists[21].id, title: "KR: Increase users by 20%", description: null },
    // OKRs — Achieved (idx 24)
    { list_id: templateLists[24].id, title: "Achieved KR", description: null },
  ];

  for (const tc of templateCardsData) {
    const exists = await templateCardRepo.findOne({
      where: { list_id: tc.list_id, title: tc.title },
    });
    if (!exists) {
      await templateCardRepo.save(templateCardRepo.create(tc));
      console.log(`  Template card: "${tc.title}"`);
    }
  }

  // ═══════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════
  console.log("\n🎉 Seed completed successfully!\n");
  await AppDataSource.destroy();
};

// ── Run directly ──
if (require.main === module) {
  seedAll().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}
