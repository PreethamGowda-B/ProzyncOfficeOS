import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { ApprovalsService } from "./approvals.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("approval-requests")
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get("pending")
  findPending(@CurrentUser() user: AuthenticatedUser) {
    return this.approvalsService.findMyPendingApprovals(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.approvalsService.findRequestDetails(id);
  }

  @Post(":id/act")
  act(
    @Param("id") id: string,
    @Body("action") action: "APPROVE" | "REJECT",
    @Body("comment") comment: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.approvalsService.submitAction(id, user.id, action, comment);
  }
}
