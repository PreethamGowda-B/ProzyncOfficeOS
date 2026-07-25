import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findClients(companyId: string) {
    return this.prisma.client.client.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        _count: { select: { projects: true, tickets: true, invoices: true } },
      },
      orderBy: { companyName: "asc" },
    });
  }

  async findClient(id: string) {
    const client = await this.prisma.client.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        projects: {
          include: {
            manager: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
        documents: true,
        tickets: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!client) throw new NotFoundException(`Client profile ${id} not found`);
    return client;
  }

  async findClientByUserId(userId: string) {
    const client = await this.prisma.client.client.findUnique({
      where: { userId },
      include: {
        projects: true,
        tickets: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!client) throw new NotFoundException(`Client account for user ${userId} not found`);
    return client;
  }

  async createClient(companyId: string, dto: { companyName: string; contactEmail: string; contactPhone?: string; userId?: string }) {
    return this.prisma.client.client.create({
      data: {
        companyId,
        companyName: dto.companyName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        userId: dto.userId,
        stage: "PROSPECT",
      },
    });
  }

  async updateClientStage(id: string, stage: string) {
    return this.prisma.client.client.update({
      where: { id },
      data: { stage: stage as any },
    });
  }

  // --- Tickets (Client support requests) ---
  async findTickets(clientId: string) {
    return this.prisma.client.ticket.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createTicket(clientId: string, dto: { subject: string; description: string }) {
    return this.prisma.client.ticket.create({
      data: {
        clientId,
        subject: dto.subject,
        description: dto.description,
        status: "OPEN",
      },
    });
  }

  async resolveTicket(id: string) {
    return this.prisma.client.ticket.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });
  }

  // --- Deliverables & Client Approvals ---
  async findDeliverables(projectId: string) {
    return this.prisma.client.deliverable.findMany({
      where: { projectId },
      orderBy: { submittedAt: "desc" },
    });
  }

  async createDeliverable(projectId: string, dto: { title: string; storageKey: string }) {
    return this.prisma.client.deliverable.create({
      data: {
        projectId,
        title: dto.title,
        storageKey: dto.storageKey,
      },
    });
  }

  async approveDeliverable(id: string, approvedByClientUserId: string) {
    return this.prisma.client.deliverable.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        approvedByClientUserId,
      },
    });
  }
}
