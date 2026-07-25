import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.client.department.findMany({
      where: { companyId },
      include: { _count: { select: { users: true, jobOpenings: true } } },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.client.department.findUnique({
      where: { id },
      include: {
        users: {
          include: { role: { select: { name: true } } },
          orderBy: { fullName: "asc" },
        },
        jobOpenings: { where: { status: "OPEN" } },
      },
    });
    if (!dept) throw new NotFoundException(`Department ${id} not found`);
    return dept;
  }

  async create(companyId: string, name: string) {
    return this.prisma.client.department.create({
      data: { companyId, name },
    });
  }

  async remove(id: string) {
    return this.prisma.client.department.delete({ where: { id } });
  }
}
