import { Controller, Get, Post, Param, Delete, UseGuards, ForbiddenException } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RoleName } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("audit-logs")
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COMPANY_ADMIN)
  getAuditLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.findAuditLogs(user.companyId);
  }

  @Get("sessions")
  getMySessions(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.findSessions(user.id);
  }

  @Delete("sessions/:id")
  revokeSession(@Param("id") sessionId: string) {
    return this.adminService.revokeSession(sessionId);
  }

  @Get("device-logins")
  getDeviceLogins(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.findDeviceLogins(user.id);
  }
}
