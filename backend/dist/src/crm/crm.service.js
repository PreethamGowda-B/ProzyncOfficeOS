"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CrmService = class CrmService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ── Leads ──────────────────────────────────────────────────────────────
    async findLeads(companyId, ownerId) {
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
    async createLead(companyId, ownerId, dto) {
        return this.prisma.client.lead.create({ data: { companyId, ownerId, ...dto, status: "NEW" } });
    }
    async updateLeadStatus(id, status) {
        return this.prisma.client.lead.update({ where: { id }, data: { status: status } });
    }
    async addFollowUp(leadId, dto) {
        return this.prisma.client.followUp.create({ data: { leadId, dueDate: new Date(dto.dueDate), notes: dto.notes } });
    }
    // ── Deals ──────────────────────────────────────────────────────────────
    async findDeals(companyId) {
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
    async createDeal(companyId, ownerId, dto) {
        return this.prisma.client.deal.create({ data: { companyId, ownerId, ...dto, stage: "PROSPECTING" } });
    }
    async updateDealStage(id, stage) {
        return this.prisma.client.deal.update({ where: { id }, data: { stage: stage, ...(stage === "WON" || stage === "LOST" ? { closedAt: new Date() } : {}) } });
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrmService);
//# sourceMappingURL=crm.service.js.map