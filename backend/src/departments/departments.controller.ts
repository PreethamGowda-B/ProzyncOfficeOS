import { Controller, Get, Post, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { DepartmentsService } from "./departments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("departments")
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.departmentsService.findAll(user.companyId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  create(@Body("name") name: string, @CurrentUser() user: AuthenticatedUser) {
    return this.departmentsService.create(user.companyId, name);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.departmentsService.remove(id);
  }
}
