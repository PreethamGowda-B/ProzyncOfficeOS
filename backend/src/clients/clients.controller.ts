import { Controller, Get, Post, Patch, Param, Body, UseGuards, ForbiddenException } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("clients")
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.clientsService.findClients(user.companyId);
  }

  @Get("me")
  async findMe(@CurrentUser() user: AuthenticatedUser) {
    if (user.roleName !== "CLIENT") throw new ForbiddenException("Only clients can access this portal page");
    return this.clientsService.findClientByUserId(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clientsService.findClient(id);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.clientsService.createClient(user.companyId, dto);
  }

  @Patch(":id/stage")
  updateStage(@Param("id") id: string, @Body("stage") stage: string) {
    return this.clientsService.updateClientStage(id, stage);
  }

  // --- Support Tickets ---
  @Get(":id/tickets")
  findTickets(@Param("id") clientId: string) {
    return this.clientsService.findTickets(clientId);
  }

  @Post(":id/tickets")
  createTicket(@Param("id") clientId: string, @Body() dto: { subject: string; description: string }) {
    return this.clientsService.createTicket(clientId, dto);
  }

  @Patch("tickets/:id/resolve")
  resolveTicket(@Param("id") id: string) {
    return this.clientsService.resolveTicket(id);
  }

  // --- Project Deliverables ---
  @Get("projects/:projectId/deliverables")
  findDeliverables(@Param("projectId") projectId: string) {
    return this.clientsService.findDeliverables(projectId);
  }

  @Post("projects/:projectId/deliverables")
  createDeliverable(@Param("projectId") projectId: string, @Body() dto: { title: string; storageKey: string }) {
    return this.clientsService.createDeliverable(projectId, dto);
  }

  @Patch("deliverables/:id/approve")
  approveDeliverable(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.clientsService.approveDeliverable(id, user.id);
  }
}
