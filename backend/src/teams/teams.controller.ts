import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("teams")
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  create(@Body() dto: { name: string; leadId?: string }) {
    return this.teamsService.create(dto.name, dto.leadId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: { name?: string; leadId?: string }) {
    return this.teamsService.update(id, dto);
  }
}
