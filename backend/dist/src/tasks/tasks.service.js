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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const POINT_VALUES = {
    TASK_COMPLETED: 10,
    TASK_BEFORE_DEADLINE: 5,
    BUG_FIXED: 3,
    LATE_TASK: -3,
    CODE_REVIEW_APPROVED: 5,
    BUILD_FAILURE: -2,
};
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, roleName, filters) {
        const isAdmin = ["SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER"].includes(roleName);
        const { projectId, status, priority, assigneeId } = filters;
        return this.prisma.client.task.findMany({
            where: {
                ...(projectId ? { projectId } : {}),
                ...(status ? { status: status } : {}),
                ...(priority ? { priority: priority } : {}),
                ...(!isAdmin ? { assigneeId: assigneeId ?? userId } : assigneeId ? { assigneeId } : {}),
            },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, fullName: true, avatarUrl: true } },
                creator: { select: { id: true, fullName: true } },
                milestone: { select: { id: true, title: true } },
                sprint: { select: { id: true, name: true } },
                _count: { select: { comments: true, subtasks: true, attachments: true } },
            },
            orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        });
    }
    async findOne(id) {
        const task = await this.prisma.client.task.findUnique({
            where: { id },
            include: {
                project: { select: { id: true, name: true } },
                assignee: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
                creator: { select: { id: true, fullName: true } },
                milestone: true,
                sprint: true,
                subtasks: {
                    include: { assignee: { select: { id: true, fullName: true, avatarUrl: true } } },
                },
                comments: {
                    include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
                    orderBy: { createdAt: "asc" },
                },
                attachments: true,
                timeLogs: { include: { user: { select: { fullName: true } } }, orderBy: { startedAt: "desc" } },
            },
        });
        if (!task)
            throw new common_1.NotFoundException(`Task ${id} not found`);
        return task;
    }
    async create(dto) {
        return this.prisma.client.task.create({
            data: {
                projectId: dto.projectId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority ?? "MEDIUM",
                assigneeId: dto.assigneeId,
                creatorId: dto.creatorId,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                estimatedHours: dto.estimatedHours,
                milestoneId: dto.milestoneId,
                sprintId: dto.sprintId,
                parentTaskId: dto.parentTaskId,
                status: "TODO",
            },
        });
    }
    async updateStatus(id, status, userId) {
        const task = await this.prisma.client.task.findUnique({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException(`Task ${id} not found`);
        const updated = await this.prisma.client.task.update({
            where: { id },
            data: {
                status: status,
                ...(status === "DONE" ? { actualHours: task.estimatedHours } : {}),
            },
        });
        // Award points if completed
        if (status === "DONE") {
            const isBeforeDeadline = task.dueDate && task.dueDate > new Date();
            await this.prisma.client.pointsLedgerEntry.createMany({
                data: [
                    { userId, reason: "TASK_COMPLETED", points: POINT_VALUES.TASK_COMPLETED, referenceType: "Task", referenceId: id },
                    ...(isBeforeDeadline
                        ? [{ userId, reason: "TASK_BEFORE_DEADLINE", points: POINT_VALUES.TASK_BEFORE_DEADLINE, referenceType: "Task", referenceId: id }]
                        : []),
                ],
            });
        }
        return updated;
    }
    async update(id, dto) {
        return this.prisma.client.task.update({
            where: { id },
            data: {
                ...dto,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                priority: dto.priority,
                status: dto.status,
                qaStatus: dto.qaStatus,
            },
        });
    }
    async addComment(taskId, authorId, body) {
        return this.prisma.client.taskComment.create({
            data: { taskId, authorId, body },
            include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
        });
    }
    async logTime(taskId, userId, dto) {
        return this.prisma.client.timeLog.create({
            data: {
                taskId,
                userId,
                startedAt: new Date(dto.startedAt),
                endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
                hours: dto.hours,
                notes: dto.notes,
            },
        });
    }
    async addDependency(taskId, dependsOnTaskId) {
        if (taskId === dependsOnTaskId) {
            throw new common_1.BadRequestException("A task cannot depend on itself");
        }
        // Check circular dependency: does dependsOnTaskId transitively depend on taskId?
        const hasPath = await this.hasTransitiveDependency(dependsOnTaskId, taskId);
        if (hasPath) {
            throw new common_1.BadRequestException("Circular dependency detected: target task transitively depends on this task");
        }
        return this.prisma.client.taskDependency.upsert({
            where: {
                dependentTaskId_dependsOnTaskId: {
                    dependentTaskId: taskId,
                    dependsOnTaskId,
                },
            },
            create: {
                dependentTaskId: taskId,
                dependsOnTaskId,
            },
            update: {},
        });
    }
    async hasTransitiveDependency(startTaskId, targetTaskId) {
        const deps = await this.prisma.client.taskDependency.findMany({
            where: { dependentTaskId: startTaskId },
        });
        for (const dep of deps) {
            if (dep.dependsOnTaskId === targetTaskId)
                return true;
            if (await this.hasTransitiveDependency(dep.dependsOnTaskId, targetTaskId))
                return true;
        }
        return false;
    }
    async removeDependency(taskId, dependsOnTaskId) {
        return this.prisma.client.taskDependency.deleteMany({
            where: {
                dependentTaskId: taskId,
                dependsOnTaskId,
            },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map