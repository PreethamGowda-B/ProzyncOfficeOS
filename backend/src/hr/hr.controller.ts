import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { HrService } from "./hr.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("hr")
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get("leaves") findLeaves(@CurrentUser() u: AuthenticatedUser) { return this.hrService.findLeaveRequests(u.id, u.roleName, u.companyId); }
  @Post("leaves") createLeave(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.hrService.createLeaveRequest(u.id, dto); }
  @Patch("leaves/:id/approve") approveLeave(@Param("id") id: string, @Body("status") status: "APPROVED" | "REJECTED", @CurrentUser() u: AuthenticatedUser) { return this.hrService.approveLeave(id, u.id, status); }
  @Get("leave-balance") leaveBalance(@CurrentUser() u: AuthenticatedUser) { return this.hrService.getLeaveBalance(u.id); }

  @Get("holidays") holidays(@CurrentUser() u: AuthenticatedUser) { return this.hrService.findHolidays(u.companyId); }
  @Post("holidays") createHoliday(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.hrService.createHoliday(u.companyId, dto); }

  @Get("performance-reviews/:userId") reviews(@Param("userId") userId: string) { return this.hrService.findPerformanceReviews(userId); }
  @Post("performance-reviews") createReview(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.hrService.createPerformanceReview({ ...dto, authorId: u.id }); }

  @Get("timesheets") findTimesheets(@CurrentUser() u: AuthenticatedUser) { return this.hrService.findTimesheets(u.id, u.roleName, u.companyId); }
  @Post("timesheets") submitTimesheet(@Body("weekStartDate") weekStartDate: string, @CurrentUser() u: AuthenticatedUser) { return this.hrService.submitTimesheet(u.id, weekStartDate); }
}
