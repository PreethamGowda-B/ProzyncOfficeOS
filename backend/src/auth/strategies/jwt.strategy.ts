import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

export interface JwtPayload {
  sub: string; // userId
}

export interface AuthenticatedUser {
  id: string;
  companyId: string;
  email: string;
  fullName: string;
  roleName: string;
  departmentId: string | null;
  teamId: string | null;
  permissionKeys: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret",
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        permissionOverrides: { include: { permission: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }

    // Effective permissions = role defaults, minus explicit denies, plus
    // explicit grants — this is the hybrid RBAC model from ARCHITECTURE.md.
    const rolePermissionKeys = new Set(user.role.permissions.map((rp) => rp.permission.key));
    for (const override of user.permissionOverrides) {
      if (override.allow) rolePermissionKeys.add(override.permission.key);
      else rolePermissionKeys.delete(override.permission.key);
    }

    return {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      fullName: user.fullName,
      roleName: user.role.name,
      departmentId: user.departmentId,
      teamId: user.teamId,
      permissionKeys: [...rolePermissionKeys],
    };
  }
}
