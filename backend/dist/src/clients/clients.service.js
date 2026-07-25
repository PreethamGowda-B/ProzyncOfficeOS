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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findClients(companyId) {
        return this.prisma.client.client.findMany({
            where: { companyId },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                _count: { select: { projects: true, tickets: true, invoices: true } },
            },
            orderBy: { companyName: "asc" },
        });
    }
    async findClient(id) {
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
        if (!client)
            throw new common_1.NotFoundException(`Client profile ${id} not found`);
        return client;
    }
    async findClientByUserId(userId) {
        const client = await this.prisma.client.client.findUnique({
            where: { userId },
            include: {
                projects: true,
                tickets: { orderBy: { createdAt: "desc" } },
                invoices: { orderBy: { createdAt: "desc" } },
            },
        });
        if (!client)
            throw new common_1.NotFoundException(`Client account for user ${userId} not found`);
        return client;
    }
    async createClient(companyId, dto) {
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
    async updateClientStage(id, stage) {
        return this.prisma.client.client.update({
            where: { id },
            data: { stage: stage },
        });
    }
    // --- Tickets (Client support requests) ---
    async findTickets(clientId) {
        return this.prisma.client.ticket.findMany({
            where: { clientId },
            orderBy: { createdAt: "desc" },
        });
    }
    async createTicket(clientId, dto) {
        return this.prisma.client.ticket.create({
            data: {
                clientId,
                subject: dto.subject,
                description: dto.description,
                status: "OPEN",
            },
        });
    }
    async resolveTicket(id) {
        return this.prisma.client.ticket.update({
            where: { id },
            data: {
                status: "RESOLVED",
                resolvedAt: new Date(),
            },
        });
    }
    // --- Deliverables & Client Approvals ---
    async findDeliverables(projectId) {
        return this.prisma.client.deliverable.findMany({
            where: { projectId },
            orderBy: { submittedAt: "desc" },
        });
    }
    async createDeliverable(projectId, dto) {
        return this.prisma.client.deliverable.create({
            data: {
                projectId,
                title: dto.title,
                storageKey: dto.storageKey,
            },
        });
    }
    async approveDeliverable(id, approvedByClientUserId) {
        return this.prisma.client.deliverable.update({
            where: { id },
            data: {
                approvedAt: new Date(),
                approvedByClientUserId,
            },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map