import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PointsService } from "./points.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("points")
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get("my-score")
  myScore(@CurrentUser() user: AuthenticatedUser) {
    return this.pointsService.getMyScore(user.id);
  }

  @Get("ledger")
  myLedger(@CurrentUser() user: AuthenticatedUser, @Query("limit") limit?: string) {
    return this.pointsService.getLedger(user.id, limit ? parseInt(limit) : undefined);
  }

  @Get("leaderboard")
  leaderboard(@Query("year") year?: string, @Query("month") month?: string) {
    const now = new Date();
    return this.pointsService.getLeaderboard(
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }
}
