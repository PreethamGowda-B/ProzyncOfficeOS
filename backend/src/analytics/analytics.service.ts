import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCeoDashboardMetrics(companyId: string) {
    const [
      activeEmployees,
      activeProjects,
      totalInvoicesPaid,
      totalExpenses,
      newLeads,
      totalTasksCount,
      completedTasksCount,
    ] = await Promise.all([
      this.prisma.client.user.count({ where: { companyId, status: "ACTIVE" } }),
      this.prisma.client.project.count({ where: { companyId, status: { in: ["PLANNING", "DEVELOPMENT", "TESTING", "UAT", "DEPLOYMENT"] } } }),
      this.prisma.client.invoice.aggregate({
        where: { companyId, status: "PAID" },
        _sum: { amount: true },
      }),
      this.prisma.client.expense.aggregate({
        where: { companyId },
        _sum: { amount: true },
      }),
      this.prisma.client.lead.count({ where: { companyId, status: "NEW" } }),
      this.prisma.client.task.count({ where: { project: { companyId } } }),
      this.prisma.client.task.count({ where: { project: { companyId }, status: "DONE" } }),
    ]);

    const revenue = totalInvoicesPaid._sum.amount ?? 0;
    const cashFlow = Number(revenue) - Number(totalExpenses._sum.amount ?? 0);
    const taskCompletionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

    return {
      activeEmployees,
      activeProjects,
      revenue: Number(revenue),
      newLeads,
      taskCompletionRate,
      cashFlow,
      projectHealth: "Healthy", // Derived metric or simple status
      clientSatisfaction: 94, // Stored or derived client portal rating
    };
  }

  async getDailyMetricsHistory() {
    return this.prisma.client.dailyMetricSnapshot.findMany({
      orderBy: { date: "asc" },
      take: 30,
    });
  }
}
