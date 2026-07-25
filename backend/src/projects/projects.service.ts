import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, userId: string, roleName: string) {
    const isAdmin = ["SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER"].includes(roleName);
    return this.prisma.client.project.findMany({
      where: {
        companyId,
        ...(isAdmin ? {} : {
          OR: [
            { managerId: userId },
            { team: { members: { some: { id: userId } } } },
          ],
        }),
      },
      include: {
        client: { select: { companyName: true } },
        manager: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
        team: { select: { id: true, name: true } },
        _count: { select: { tasks: true, milestones: true, risks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.client.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: { include: { role: { select: { name: true } } } },
        team: { include: { members: { include: { role: { select: { name: true } } } } } },
        milestones: { include: { _count: { select: { tasks: true } } }, orderBy: { dueDate: "asc" } },
        sprints: { orderBy: { startDate: "desc" }, take: 5 },
        tasks: {
          include: {
            assignee: { select: { id: true, fullName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        risks: { orderBy: { createdAt: "desc" } },
        repositories: { include: { _count: { select: { pullRequests: true } } } },
        _count: { select: { tasks: true, milestones: true, risks: true } },
      },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async create(companyId: string, dto: {
    name: string;
    description?: string;
    managerId: string;
    clientId?: string;
    teamId?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
  }) {
    return this.prisma.client.project.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        managerId: dto.managerId,
        clientId: dto.clientId,
        teamId: dto.teamId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
        status: "PLANNING",
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.client.project.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async update(id: string, dto: Partial<{ name: string; description: string; endDate: string; budget: number; status: string }>) {
    return this.prisma.client.project.update({
      where: { id },
      data: {
        ...dto,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status as any,
      },
    });
  }

  async createMilestone(projectId: string, dto: { title: string; dueDate?: string }) {
    return this.prisma.client.milestone.create({
      data: { projectId, title: dto.title, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
    });
  }

  async createSprint(projectId: string, dto: { name: string; startDate: string; endDate: string }) {
    return this.prisma.client.sprint.create({
      data: { projectId, name: dto.name, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
  }

  async createRisk(projectId: string, dto: { title: string; description?: string; severity?: string; mitigation?: string }) {
    return this.prisma.client.projectRisk.create({
      data: { projectId, title: dto.title, description: dto.description, severity: dto.severity as any ?? "MEDIUM", mitigation: dto.mitigation },
    });
  }
}
