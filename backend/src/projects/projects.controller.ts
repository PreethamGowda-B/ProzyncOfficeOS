import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(user.companyId, user.id, user.roleName);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.create(user.companyId, dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: any) {
    return this.projectsService.update(id, dto);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.projectsService.updateStatus(id, status);
  }

  @Post(":id/milestones")
  createMilestone(@Param("id") id: string, @Body() dto: { title: string; dueDate?: string }) {
    return this.projectsService.createMilestone(id, dto);
  }

  @Post(":id/sprints")
  createSprint(@Param("id") id: string, @Body() dto: { name: string; startDate: string; endDate: string }) {
    return this.projectsService.createSprint(id, dto);
  }

  @Post(":id/risks")
  createRisk(@Param("id") id: string, @Body() dto: any) {
    return this.projectsService.createRisk(id, dto);
  }
}
