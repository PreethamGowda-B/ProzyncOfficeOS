import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Leads ──────────────────────────────────────────────────────────────
  async findLeads(companyId: string, ownerId?: string) {
    return this.prisma.client.lead.findMany({
      where: { companyId, ...(ownerId ? { ownerId } : {}) },
      include: {
        owner: { select: { id: true, fullName: true, avatarUrl: true } },
        followUps: { where: { completed: false }, orderBy: { dueDate: "asc" }, take: 1 },
        deal: { select: { id: true, stage: true, value: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createLead(companyId: string, ownerId: string, dto: { contactName: string; email?: string; phone?: string; companyName?: string; source?: string }) {
    return this.prisma.client.lead.create({ data: { companyId, ownerId, ...dto, status: "NEW" } });
  }

  async updateLeadStatus(id: string, status: string) {
    return this.prisma.client.lead.update({ where: { id }, data: { status: status as any } });
  }

  async addFollowUp(leadId: string, dto: { dueDate: string; notes?: string }) {
    return this.prisma.client.followUp.create({ data: { leadId, dueDate: new Date(dto.dueDate), notes: dto.notes } });
  }

  // ── Deals ──────────────────────────────────────────────────────────────
  async findDeals(companyId: string) {
    return this.prisma.client.deal.findMany({
      where: { companyId },
      include: {
        lead: { select: { contactName: true, companyName: true } },
        client: { select: { companyName: true } },
        owner: { select: { id: true, fullName: true, avatarUrl: true } },
        proposals: { orderBy: { createdAt: "desc" }, take: 1 },
        contracts: { orderBy: { signedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createDeal(companyId: string, ownerId: string, dto: { title: string; value?: number; leadId?: string; clientId?: string }) {
    return this.prisma.client.deal.create({ data: { companyId, ownerId, ...dto, stage: "PROSPECTING" } });
  }

  async updateDealStage(id: string, stage: string) {
    return this.prisma.client.deal.update({ where: { id }, data: { stage: stage as any, ...(stage === "WON" || stage === "LOST" ? { closedAt: new Date() } : {}) } });
  }
}
