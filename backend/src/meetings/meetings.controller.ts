import { Controller, Get, Post, Body, Param, Patch, UseGuards } from "@nestjs/common";
import { MeetingsService } from "./meetings.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("meetings")
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get("upcoming")
  findUpcoming(@CurrentUser() user: AuthenticatedUser) {
    return this.meetingsService.findUpcoming(user.id);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.meetingsService.create(user.id, dto);
  }

  @Patch(":id/attendance")
  updateAttendance(
    @Param("id") meetingId: string,
    @Body("userId") userId: string,
    @Body("attended") attended: boolean,
  ) {
    return this.meetingsService.updateAttendance(meetingId, userId, attended);
  }
}
