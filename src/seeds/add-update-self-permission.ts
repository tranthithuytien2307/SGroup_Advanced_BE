/**
 * Quick-fix migration script:
 * Inserts the missing "update_self" permission and assigns it to all roles.
 * Run once: pnpm ts-node src/seeds/add-update-self-permission.ts
 */
import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { Permission } from "../entities/permission.entity";
import { Role } from "../entities/role.entity";
import { RolePermission } from "../entities/role-permission.entity";

async function run() {
  await AppDataSource.initialize();
  console.log("✅ DB connected\n");

  const permRepo = AppDataSource.getRepository(Permission);
  const roleRepo = AppDataSource.getRepository(Role);
  const rpRepo = AppDataSource.getRepository(RolePermission);

  // 1. Upsert permission
  let perm = await permRepo.findOne({ where: { name: "update_self" } });
  if (!perm) {
    perm = permRepo.create({ name: "update_self" });
    await permRepo.save(perm);
    console.log("✔ Permission 'update_self' created");
  } else {
    console.log("ℹ Permission 'update_self' already exists");
  }

  // 2. Assign to every role (admin, staff, user — anyone should update themselves)
  const allRoles = await roleRepo.find();
  for (const role of allRoles) {
    const exists = await rpRepo.findOne({
      where: { role: { id: role.id }, permission: { id: perm!.id } },
    });
    if (!exists) {
      await rpRepo.save(rpRepo.create({ role, permission: perm! }));
      console.log(`✔ Assigned 'update_self' → role "${role.name}"`);
    } else {
      console.log(`ℹ Role "${role.name}" already has 'update_self'`);
    }
  }

  await AppDataSource.destroy();
  console.log("\n🎉 Done!");
}

run().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
