import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAuditLogs(companyId: string, limit = 100) {
    return this.prisma.client.auditLog.findMany({
      where: { user: { companyId } },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findSessions(userId: string) {
    return this.prisma.client.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  }

  async revokeSession(sessionId: string) {
    const session = await this.prisma.client.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    return this.prisma.client.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async findDeviceLogins(userId: string) {
    return this.prisma.client.deviceLogin.findMany({
      where: { userId },
      orderBy: { loggedInAt: "desc" },
      take: 20,
    });
  }

  async logAuditEvent(dto: { userId?: string; action: string; entityType: string; entityId?: string; beforeValue?: any; afterValue?: any; ipAddress?: string; userAgent?: string }) {
    return this.prisma.client.auditLog.create({
      data: {
        userId: dto.userId,
        action: dto.action as any,
        entityType: dto.entityType,
        entityId: dto.entityId,
        beforeValue: dto.beforeValue,
        afterValue: dto.afterValue,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }
}
