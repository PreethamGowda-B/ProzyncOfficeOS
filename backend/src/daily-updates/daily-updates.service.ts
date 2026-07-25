import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DailyUpdatesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertToday(userId: string, dto: { completedItems: string[]; plannedItems: string[] }) {
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

  async findByUser(userId: string, limit = 14) {
    return this.prisma.client.dailyUpdate.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    });
  }

  async findTeam(userIds: string[], date?: Date) {
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
  async applyMissedPenalties(userIds: string[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const submitted = await this.prisma.client.dailyUpdate.findMany({
      where: { date: { gte: today }, userId: { in: userIds } },
      select: { userId: true },
    });

    const submittedIds = new Set(submitted.map((u) => u.userId));
    const missed = userIds.filter((id) => !submittedIds.has(id));

    if (missed.length === 0) return { penalized: 0 };

    await this.prisma.client.pointsLedgerEntry.createMany({
      data: missed.map((userId) => ({
        userId,
        reason: "MISSED_UPDATE" as const,
        points: -5,
        note: `Missed daily update for ${today.toISOString().split("T")[0]}`,
      })),
    });

    return { penalized: missed.length };
  }
}
