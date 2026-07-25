import { SetMetadata } from "@nestjs/common";
import { RoleName } from "@prisma/client";

export const ROLES_KEY = "roles";

// Usage: @Roles(RoleName.SUPER_ADMIN, RoleName.COMPANY_ADMIN)
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
