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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAuditLogs(companyId, limit = 100) {
        return this.prisma.client.auditLog.findMany({
            where: { user: { companyId } },
            include: { user: { select: { id: true, fullName: true, email: true } } },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async findSessions(userId) {
        return this.prisma.client.session.findMany({
            where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
            orderBy: { createdAt: "desc" },
        });
    }
    async revokeSession(sessionId) {
        const session = await this.prisma.client.session.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException(`Session ${sessionId} not found`);
        return this.prisma.client.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
    }
    async findDeviceLogins(userId) {
        return this.prisma.client.deviceLogin.findMany({
            where: { userId },
            orderBy: { loggedInAt: "desc" },
            take: 20,
        });
    }
    async logAuditEvent(dto) {
        return this.prisma.client.auditLog.create({
            data: {
                userId: dto.userId,
                action: dto.action,
                entityType: dto.entityType,
                entityId: dto.entityId,
                beforeValue: dto.beforeValue,
                afterValue: dto.afterValue,
                ipAddress: dto.ipAddress,
                userAgent: dto.userAgent,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map