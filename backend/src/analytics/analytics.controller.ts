import { Controller, Get, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RoleName } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("ceo-dashboard")
  @Roles(RoleName.SUPER_ADMIN, RoleName.COMPANY_ADMIN)
  getCeoMetrics(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getCeoDashboardMetrics(user.companyId);
  }

  @Get("history")
  @Roles(RoleName.SUPER_ADMIN, RoleName.COMPANY_ADMIN)
  getMetricsHistory() {
    return this.analyticsService.getDailyMetricsHistory();
  }
}
