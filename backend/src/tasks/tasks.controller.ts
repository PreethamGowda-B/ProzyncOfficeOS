import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Delete } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { Audit } from "../admin/decorators/audit.decorator";
import { AuditAction } from "@prisma/client";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("projectId") projectId?: string,
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("assigneeId") assigneeId?: string,
  ) {
    return this.tasksService.findAll(user.id, user.roleName, { projectId, status, priority, assigneeId });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Audit(AuditAction.CREATE, "Task")
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.create({ ...dto, creatorId: user.id });
  }

  @Patch(":id")
  @Audit(AuditAction.UPDATE, "Task")
  update(@Param("id") id: string, @Body() dto: any) {
    return this.tasksService.update(id, dto);
  }

  @Patch(":id/status")
  @Audit(AuditAction.UPDATE, "Task")
  updateStatus(@Param("id") id: string, @Body("status") status: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.updateStatus(id, status, user.id);
  }

  @Post(":id/comments")
  addComment(@Param("id") id: string, @Body("body") body: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.addComment(id, user.id, body);
  }

  @Post(":id/time-logs")
  logTime(@Param("id") id: string, @Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.logTime(id, user.id, dto);
  }

  @Post(":id/dependencies")
  addDependency(@Param("id") id: string, @Body("dependsOnTaskId") dependsOnTaskId: string) {
    return this.tasksService.addDependency(id, dependsOnTaskId);
  }

  @Delete(":id/dependencies/:dependsOnTaskId")
  removeDependency(@Param("id") id: string, @Param("dependsOnTaskId") dependsOnTaskId: string) {
    return this.tasksService.removeDependency(id, dependsOnTaskId);
  }
}
