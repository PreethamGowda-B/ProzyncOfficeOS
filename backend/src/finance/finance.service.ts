import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApprovalsService } from "../approvals/approvals.service";

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvalsService: ApprovalsService,
  ) {}

  async findInvoices(companyId: string, status?: string) {
    return this.prisma.client.invoice.findMany({
      where: { companyId, ...(status ? { status: status as any } : {}) },
      include: { client: { select: { companyName: true } }, project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInvoice(companyId: string, dto: { clientId: string; projectId?: string; amount: number; gstAmount?: number; dueDate?: string }) {
    const count = await this.prisma.client.invoice.count({ where: { companyId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    return this.prisma.client.invoice.create({
      data: { companyId, ...dto, invoiceNumber, amount: dto.amount, status: "DRAFT", dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
    });
  }

  async updateInvoiceStatus(id: string, status: string) {
    return this.prisma.client.invoice.update({ where: { id }, data: { status: status as any, ...(status === "PAID" ? { paidAt: new Date() } : {}) } });
  }

  async findExpenses(companyId: string) {
    return this.prisma.client.expense.findMany({ where: { companyId }, orderBy: { incurredAt: "desc" } });
  }

  async createExpense(companyId: string, userId: string, dto: { category: string; amount: number; description?: string; incurredAt: string }) {
    const expense = await this.prisma.client.expense.create({ data: { companyId, ...dto, incurredAt: new Date(dto.incurredAt) } });

    const approval = await this.approvalsService.createApprovalRequest(
      companyId,
      "EXPENSE",
      "Expense",
      expense.id,
      userId,
    );

    return this.prisma.client.expense.update({
      where: { id: expense.id },
      data: { approvalRequestId: approval.id },
    });
  }

  async getRevenueSummary(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevenue, monthRevenue, pending, expenses] = await Promise.all([
      this.prisma.client.invoice.aggregate({ where: { companyId, status: "PAID" }, _sum: { amount: true } }),
      this.prisma.client.invoice.aggregate({ where: { companyId, status: "PAID", paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      this.prisma.client.invoice.aggregate({ where: { companyId, status: { in: ["SENT", "OVERDUE"] } }, _sum: { amount: true } }),
      this.prisma.client.expense.aggregate({ where: { companyId, incurredAt: { gte: startOfMonth } }, _sum: { amount: true } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount ?? 0,
      monthRevenue: monthRevenue._sum.amount ?? 0,
      pendingAmount: pending._sum.amount ?? 0,
      monthExpenses: expenses._sum.amount ?? 0,
    };
  }

  async findPayroll(userId: string) {
    return this.prisma.client.payroll.findMany({ where: { userId }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 });
  }
}
