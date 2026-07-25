import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("crm")
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get("leads") findLeads(@CurrentUser() u: AuthenticatedUser) { return this.crmService.findLeads(u.companyId); }
  @Post("leads") createLead(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.crmService.createLead(u.companyId, u.id, dto); }
  @Patch("leads/:id/status") updateLeadStatus(@Param("id") id: string, @Body("status") status: string) { return this.crmService.updateLeadStatus(id, status); }
  @Post("leads/:id/follow-ups") addFollowUp(@Param("id") id: string, @Body() dto: any) { return this.crmService.addFollowUp(id, dto); }

  @Get("deals") findDeals(@CurrentUser() u: AuthenticatedUser) { return this.crmService.findDeals(u.companyId); }
  @Post("deals") createDeal(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.crmService.createDeal(u.companyId, u.id, dto); }
  @Patch("deals/:id/stage") updateDealStage(@Param("id") id: string, @Body("stage") stage: string) { return this.crmService.updateDealStage(id, stage); }
}
