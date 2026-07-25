import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAnnouncements(companyId: string, audience?: string) {
    return this.prisma.client.announcement.findMany({
      where: {
        companyId,
        ...(audience ? { audience } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(companyId: string, postedById: string, dto: { title: string; body: string; audience?: string }) {
    return this.prisma.client.announcement.create({
      data: {
        companyId,
        postedById,
        title: dto.title,
        body: dto.body,
        audience: dto.audience ?? "company",
      },
    });
  }
}
