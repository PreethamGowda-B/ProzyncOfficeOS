import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleName } from "@prisma/client";
import { PERMISSION_KEY } from "../decorators/require-permission.decorator";
import type { AuthenticatedUser } from "../strategies/jwt.strategy";

// Fine-grained check on top of RolesGuard — use when a role isn't specific
// enough (e.g. only Finance + whoever has the "invoice:approve" override).
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) return true;

    const user: AuthenticatedUser = context.switchToHttp().getRequest().user;
    if (!user) return false;
    if (user.roleName === RoleName.SUPER_ADMIN) return true;

    if (!user.permissionKeys.includes(requiredPermission)) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }
    return true;
  }
}
