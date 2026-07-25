import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApprovalsService } from "../approvals/approvals.service";

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvalsService: ApprovalsService,
  ) {}

  async findLeaveRequests(userId: string, roleName: string, companyId: string) {
    const isHr = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(roleName);
    return this.prisma.client.leaveRequest.findMany({
      where: isHr ? { user: { companyId } } : { userId },
      include: { user: { select: { id: true, fullName: true, avatarUrl: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createLeaveRequest(userId: string, dto: { type: string; startDate: string; endDate: string; reason?: string }) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const leaveRequest = await this.prisma.client.leaveRequest.create({
      data: { userId, type: dto.type as any, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate), reason: dto.reason, status: "PENDING" },
    });

    const approval = await this.approvalsService.createApprovalRequest(
      user.companyId,
      "LEAVE",
      "LeaveRequest",
      leaveRequest.id,
      userId,
    );

    return this.prisma.client.leaveRequest.update({
      where: { id: leaveRequest.id },
      data: {
        approvalRequestId: approval.id,
        status: approval.status as any,
      },
    });
  }

  async approveLeave(id: string, approverId: string, status: "APPROVED" | "REJECTED") {
    return this.prisma.client.leaveRequest.update({ where: { id }, data: { status, approvedById: approverId } });
  }

  async getLeaveBalance(userId: string) {
    return this.prisma.client.leaveBalance.findUnique({ where: { userId } });
  }

  async findHolidays(companyId: string) {
    const now = new Date();
    return this.prisma.client.holiday.findMany({
      where: { companyId, date: { gte: new Date(now.getFullYear(), 0, 1) } },
      orderBy: { date: "asc" },
    });
  }

  async createHoliday(companyId: string, dto: { name: string; date: string }) {
    return this.prisma.client.holiday.create({ data: { companyId, name: dto.name, date: new Date(dto.date) } });
  }

  async findPerformanceReviews(subjectId: string) {
    return this.prisma.client.performanceReview.findMany({
      where: { subjectId },
      include: { author: { select: { fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createPerformanceReview(dto: { subjectId: string; authorId: string; periodStart: string; periodEnd: string; rating?: number; strengths?: string; improvements?: string }) {
    return this.prisma.client.performanceReview.create({
      data: { ...dto, periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd) },
    });
  }

  async findTimesheets(userId: string, roleName: string, companyId: string) {
    const isHr = ["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"].includes(roleName);
    return this.prisma.client.timesheet.findMany({
      where: isHr ? {} : { userId },
      orderBy: { weekStartDate: "desc" },
    });
  }

  async submitTimesheet(userId: string, weekStartDateStr: string) {
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
    if (!user) throw new NotFoundException(`User ${userId} not found`);

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
    const approval = await this.approvalsService.createApprovalRequest(
      user.companyId,
      "TIMESHEET",
      "Timesheet",
      timesheet.id,
      userId,
    );

    return this.prisma.client.timesheet.update({
      where: { id: timesheet.id },
      data: {
        approvalRequestId: approval.id,
      },
    });
  }
}
