import { AppDataSource } from "../data-source";
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role-permission.entity";

// ---- 1. Role ----
const defaultRoles = [
  { name: "admin", description: "System Administrator" },
  { name: "staff", description: "Staff / Manager" },
  { name: "user", description: "General user" },
];

// ---- 2. Permission ----
const defaultPermissions = [
  { name: "create_user" },
  { name: "delete_user" },
  { name: "update_user" },
  { name: "view_all" },
  { name: "view_self" },
];

  // ---- 3. Mapping role <-> permissions ----
const rolePermissionMap: Record<string, string[]> = {
  admin: [
    "create_user",
    "delete_user",
    "update_user",
    "view_all",
    "view_self",
  ],
  staff: ["update_user", "view_all", "view_self"],
  user: ["view_self"],
};

export const seedRBAC = async () => {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const permRepo = AppDataSource.getRepository(Permission);
  const rolePermRepo = AppDataSource.getRepository(RolePermission);

  /* -----------------------------
          Insert Roles
  ----------------------------- */
  for (const r of defaultRoles) {
    const exists = await roleRepo.findOne({ where: { name: r.name } });
    if (!exists) {
      await roleRepo.save(r);
      console.log(`Role created: ${r.name}`);
    } else {
      console.log(`Role existed: ${r.name}`);
    }
  }

  /* -----------------------------
          Insert Permissions
  ----------------------------- */
  for (const p of defaultPermissions) {
    const exists = await permRepo.findOne({ where: { name: p.name } });
    if (!exists) {
      await permRepo.save(p);
      console.log(`Permission created: ${p.name}`);
    } else {
      console.log(`Permission existed: ${p.name}`);
    }
  }

  /* -----------------------------
      Insert Role-Permission Mapping
  ----------------------------- */
  for (const [roleName, permissions] of Object.entries(rolePermissionMap)) {
    const role = await roleRepo.findOne({ where: { name: roleName } });
    if (!role) continue;

    for (const permName of permissions) {
      const permission = await permRepo.findOne({
        where: { name: permName },
      });
      if (!permission) continue;

      const exists = await rolePermRepo.findOne({
        where: {
          role: { id: role.id },
          permission: { id: permission.id },
        },
      });

      if (!exists) {
        await rolePermRepo.save({
          role,
          permission,
        });
        console.log(`Mapping added: ${role.name} -> ${permission.name}`);
      }
    }
  }
  await AppDataSource.destroy();
};

// Run if directly executed
if (require.main === module) {
  seedRBAC();
}
