import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyScore(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      await this.recalculateMonthlyScores(year, month);
    } catch (e) {
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

  async getLeaderboard(year: number, month: number) {
    try {
      await this.recalculateMonthlyScores(year, month);
    } catch (e) {
      console.error("Failed to recalculate monthly scores for leaderboard:", e);
    }

    const scores = await this.prisma.client.monthlyScore.findMany({
      where: { year, month },
      orderBy: { totalPoints: "desc" },
      take: 50,
    });

    if (scores.length === 0) return [];

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

  async getLedger(userId: string, limit = 50) {
    return this.prisma.client.pointsLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /** Recalculate and upsert MonthlyScore for all users for a given month */
  async recalculateMonthlyScores(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const grouped = await this.prisma.client.pointsLedgerEntry.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: start, lt: end } },
      _sum: { points: true },
      orderBy: { _sum: { points: "desc" } },
    });

    const upserts = grouped.map((g, index) =>
      this.prisma.client.monthlyScore.upsert({
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
      }),
    );

    await this.prisma.client.$transaction(upserts);
    return { updated: grouped.length };
  }
}
