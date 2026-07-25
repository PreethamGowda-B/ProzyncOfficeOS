import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.team.findMany({
      include: {
        lead: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
        _count: { select: { members: true, projects: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.client.team.findUnique({
      where: { id },
      include: {
        lead: { include: { role: { select: { name: true } } } },
        members: {
          include: { role: { select: { name: true } }, department: { select: { name: true } } },
          orderBy: { fullName: "asc" },
        },
        projects: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return team;
  }

  async create(name: string, leadId?: string) {
    return this.prisma.client.team.create({
      data: { name, leadId },
    });
  }

  async update(id: string, dto: { name?: string; leadId?: string }) {
    return this.prisma.client.team.update({
      where: { id },
      data: dto,
    });
  }
}
