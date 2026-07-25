import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = "permission";

// Usage: @RequirePermission("salary:view:all")
export const RequirePermission = (key: string) => SetMetadata(PERMISSION_KEY, key);
