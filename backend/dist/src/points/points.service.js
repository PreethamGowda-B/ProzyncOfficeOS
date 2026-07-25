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
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PointsService = class PointsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyScore(userId) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        try {
            await this.recalculateMonthlyScores(year, month);
        }
        catch (e) {
            console.error("Failed to recalculate monthly scores:", e);
        }
        const [total, monthly, ledger] = await Promise.all([
            this.prisma.client.pointsLedgerEntry.aggregate({ where: { userId }, _sum: { points: true } }),
            this.prisma.client.monthlyScore.findUnique({ where: { userId_year_month: { userId, year, month } } }),
            this.prisma.client.pointsLedgerEntry.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
        ]);
        return {
            totalAllTime: total._sum.points ?? 0,
            thisMonth: monthly?.totalPoints ?? 0,
            rank: monthly?.rank ?? null,
            isTopPerformer: monthly?.isTopPerformer ?? false,
            recentEntries: ledger,
        };
    }
    async getLeaderboard(year, month) {
        try {
            await this.recalculateMonthlyScores(year, month);
        }
        catch (e) {
            console.error("Failed to recalculate monthly scores for leaderboard:", e);
        }
        const scores = await this.prisma.client.monthlyScore.findMany({
            where: { year, month },
            orderBy: { totalPoints: "desc" },
            take: 50,
        });
        if (scores.length === 0)
            return [];
        const userIds = scores.map((s) => s.userId);
        const users = await this.prisma.client.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true, displayName: true, avatarUrl: true, role: { select: { name: true } } },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        return scores.map((s) => ({
            ...userMap.get(s.userId),
            totalPoints: s.totalPoints,
            rank: s.rank,
            isTopPerformer: s.isTopPerformer,
        }));
    }
    async getLedger(userId, limit = 50) {
        return this.prisma.client.pointsLedgerEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    /** Recalculate and upsert MonthlyScore for all users for a given month */
    async recalculateMonthlyScores(year, month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        const grouped = await this.prisma.client.pointsLedgerEntry.groupBy({
            by: ["userId"],
            where: { createdAt: { gte: start, lt: end } },
            _sum: { points: true },
            orderBy: { _sum: { points: "desc" } },
        });
        const upserts = grouped.map((g, index) => this.prisma.client.monthlyScore.upsert({
            where: { userId_year_month: { userId: g.userId, year, month } },
            create: {
                userId: g.userId,
                year,
                month,
                totalPoints: g._sum.points ?? 0,
                rank: index + 1,
                isTopPerformer: index === 0,
            },
            update: {
                totalPoints: g._sum.points ?? 0,
                rank: index + 1,
                isTopPerformer: index === 0,
            },
        }));
        await this.prisma.client.$transaction(upserts);
        return { updated: grouped.length };
    }
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PointsService);
//# sourceMappingURL=points.service.js.map