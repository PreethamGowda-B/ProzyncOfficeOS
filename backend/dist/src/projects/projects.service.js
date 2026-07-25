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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(companyId, userId, roleName) {
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
    async findOne(id) {
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
        if (!project)
            throw new common_1.NotFoundException(`Project ${id} not found`);
        return project;
    }
    async create(companyId, dto) {
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
    async updateStatus(id, status) {
        return this.prisma.client.project.update({
            where: { id },
            data: { status: status },
        });
    }
    async update(id, dto) {
        return this.prisma.client.project.update({
            where: { id },
            data: {
                ...dto,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                status: dto.status,
            },
        });
    }
    async createMilestone(projectId, dto) {
        return this.prisma.client.milestone.create({
            data: { projectId, title: dto.title, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
        });
    }
    async createSprint(projectId, dto) {
        return this.prisma.client.sprint.create({
            data: { projectId, name: dto.name, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
        });
    }
    async createRisk(projectId, dto) {
        return this.prisma.client.projectRisk.create({
            data: { projectId, title: dto.title, description: dto.description, severity: dto.severity ?? "MEDIUM", mitigation: dto.mitigation },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map