import { Controller, Post, Body, Query, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("summarize-day")
  summarize(@CurrentUser() user: AuthenticatedUser, @Query("date") dateStr?: string) {
    return this.aiService.summarizeDailyWork(user.id, dateStr);
  }

  @Post("ask")
  ask(@Body("question") question: string, @CurrentUser() user: AuthenticatedUser) {
    return this.aiService.answerPolicyQuestion(user.companyId, question);
  }

  @Post("analyze-risks")
  analyzeRisks(@Body("projectId") projectId: string) {
    return this.aiService.analyzeProjectRisks(projectId);
  }
}
