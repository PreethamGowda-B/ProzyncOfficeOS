import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { AnnouncementsService } from "./announcements.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("announcements")
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findAnnouncements(@CurrentUser() user: AuthenticatedUser, @Query("audience") audience?: string) {
    return this.announcementsService.findAnnouncements(user.companyId, audience);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.announcementsService.create(user.companyId, user.id, dto);
  }
}
