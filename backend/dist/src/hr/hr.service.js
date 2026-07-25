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
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const approvals_service_1 = require("../approvals/approvals.service");
let HrService = class HrService {
    constructor(prisma, approvalsService) {
        this.prisma = prisma;
        this.approvalsService = approvalsService;
    }
    async findLeaveRequests(userId, roleName, companyId) {
        const isHr = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(roleName);
        return this.prisma.client.leaveRequest.findMany({
            where: isHr ? { user: { companyId } } : { userId },
            include: { user: { select: { id: true, fullName: true, avatarUrl: true, department: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async createLeaveRequest(userId, dto) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });
        if (!user)
            throw new common_1.NotFoundException(`User ${userId} not found`);
        const leaveRequest = await this.prisma.client.leaveRequest.create({
            data: { userId, type: dto.type, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate), reason: dto.reason, status: "PENDING" },
        });
        const approval = await this.approvalsService.createApprovalRequest(user.companyId, "LEAVE", "LeaveRequest", leaveRequest.id, userId);
        return this.prisma.client.leaveRequest.update({
            where: { id: leaveRequest.id },
            data: {
                approvalRequestId: approval.id,
                status: approval.status,
            },
        });
    }
    async approveLeave(id, approverId, status) {
        return this.prisma.client.leaveRequest.update({ where: { id }, data: { status, approvedById: approverId } });
    }
    async getLeaveBalance(userId) {
        return this.prisma.client.leaveBalance.findUnique({ where: { userId } });
    }
    async findHolidays(companyId) {
        const now = new Date();
        return this.prisma.client.holiday.findMany({
            where: { companyId, date: { gte: new Date(now.getFullYear(), 0, 1) } },
            orderBy: { date: "asc" },
        });
    }
    async createHoliday(companyId, dto) {
        return this.prisma.client.holiday.create({ data: { companyId, name: dto.name, date: new Date(dto.date) } });
    }
    async findPerformanceReviews(subjectId) {
        return this.prisma.client.performanceReview.findMany({
            where: { subjectId },
            include: { author: { select: { fullName: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async createPerformanceReview(dto) {
        return this.prisma.client.performanceReview.create({
            data: { ...dto, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd) },
        });
    }
    async findTimesheets(userId, roleName, companyId) {
        const isHr = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(roleName);
        return this.prisma.client.timesheet.findMany({
            where: isHr ? {} : { userId },
            orderBy: { weekStartDate: "desc" },
        });
    }
    async submitTimesheet(userId, weekStartDateStr) {
        const weekStartDate = new Date(weekStartDateStr);
        weekStartDate.setHours(0, 0, 0, 0);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 7);
        // Sum hours from TimeLogs in that week
        const logs = await this.prisma.client.timeLog.findMany({
            where: {
                userId,
                startedAt: {
                    gte: weekStartDate,
                    lt: weekEndDate,
                },
            },
        });
        const totalHours = logs.reduce((sum, log) => sum + (log.hours ?? 0), 0);
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            select: { companyId: true },
        });
        if (!user)
            throw new common_1.NotFoundException(`User ${userId} not found`);
        // Create or update the timesheet
        const timesheet = await this.prisma.client.timesheet.upsert({
            where: {
                userId_weekStartDate: {
                    userId,
                    weekStartDate,
                },
            },
            create: {
                userId,
                weekStartDate,
                totalHours,
            },
            update: {
                totalHours,
            },
        });
        // Create ApprovalRequest
        const approval = await this.approvalsService.createApprovalRequest(user.companyId, "TIMESHEET", "Timesheet", timesheet.id, userId);
        return this.prisma.client.timesheet.update({
            where: { id: timesheet.id },
            data: {
                approvalRequestId: approval.id,
            },
        });
    }
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        approvals_service_1.ApprovalsService])
], HrService);
//# sourceMappingURL=hr.service.js.map