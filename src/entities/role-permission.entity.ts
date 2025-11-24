import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

@Entity("role_permissions")
export class RolePermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  permission!: Permission;
}
