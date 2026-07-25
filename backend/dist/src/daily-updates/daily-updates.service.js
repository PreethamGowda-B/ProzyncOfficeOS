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
exports.DailyUpdatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DailyUpdatesService = class DailyUpdatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertToday(userId, dto) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const update = await this.prisma.client.dailyUpdate.upsert({
            where: { userId_date: { userId, date: today } },
            create: { userId, date: today, completedItems: dto.completedItems, plannedItems: dto.plannedItems },
            update: { completedItems: dto.completedItems, plannedItems: dto.plannedItems },
        });
        // Award +1 point for submitting (only if first submission today)
        const existingPoint = await this.prisma.client.pointsLedgerEntry.findFirst({
            where: {
                userId,
                reason: "DAILY_UPDATE_SUBMITTED",
                createdAt: { gte: today },
            },
        });
        if (!existingPoint) {
            await this.prisma.client.pointsLedgerEntry.create({
                data: { userId, reason: "DAILY_UPDATE_SUBMITTED", points: 1, referenceType: "DailyUpdate", referenceId: update.id },
            });
        }
        return update;
    }
    async findByUser(userId, limit = 14) {
        return this.prisma.client.dailyUpdate.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: limit,
        });
    }
    async findTeam(userIds, date) {
        const targetDate = date ?? new Date();
        targetDate.setHours(0, 0, 0, 0);
        return this.prisma.client.dailyUpdate.findMany({
            where: {
                userId: { in: userIds },
                date: { gte: targetDate },
            },
            include: {
                user: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    /** Called by a nightly cron to penalize users who didn't submit */
    async applyMissedPenalties(userIds) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const submitted = await this.prisma.client.dailyUpdate.findMany({
            where: { date: { gte: today }, userId: { in: userIds } },
            select: { userId: true },
        });
        const submittedIds = new Set(submitted.map((u) => u.userId));
        const missed = userIds.filter((id) => !submittedIds.has(id));
        if (missed.length === 0)
            return { penalized: 0 };
        await this.prisma.client.pointsLedgerEntry.createMany({
            data: missed.map((userId) => ({
                userId,
                reason: "MISSED_UPDATE",
                points: -5,
                note: `Missed daily update for ${today.toISOString().split("T")[0]}`,
            })),
        });
        return { penalized: missed.length };
    }
};
exports.DailyUpdatesService = DailyUpdatesService;
exports.DailyUpdatesService = DailyUpdatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DailyUpdatesService);
//# sourceMappingURL=daily-updates.service.js.map