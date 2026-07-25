import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { DailyUpdatesService } from "./daily-updates.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("daily-updates")
@UseGuards(JwtAuthGuard)
export class DailyUpdatesController {
  constructor(private readonly dailyUpdatesService: DailyUpdatesService) {}

  @Post()
  submit(@Body() dto: { completedItems: string[]; plannedItems: string[] }, @CurrentUser() user: AuthenticatedUser) {
    return this.dailyUpdatesService.upsertToday(user.id, dto);
  }

  @Get("my")
  myHistory(@CurrentUser() user: AuthenticatedUser, @Query("limit") limit?: string) {
    return this.dailyUpdatesService.findByUser(user.id, limit ? parseInt(limit) : undefined);
  }
}
