import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleName } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../strategies/jwt.strategy";

// Runs after JwtAuthGuard has populated request.user. SUPER_ADMIN always
// passes, since they're above every module's role list by definition.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user: AuthenticatedUser = context.switchToHttp().getRequest().user;
    if (!user) return false;
    if (user.roleName === RoleName.SUPER_ADMIN) return true;

    if (!requiredRoles.includes(user.roleName as RoleName)) {
      throw new ForbiddenException(`Requires one of roles: ${requiredRoles.join(", ")}`);
    }
    return true;
  }
}
