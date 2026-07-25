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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const approvals_service_1 = require("../approvals/approvals.service");
let FinanceService = class FinanceService {
    constructor(prisma, approvalsService) {
        this.prisma = prisma;
        this.approvalsService = approvalsService;
    }
    async findInvoices(companyId, status) {
        return this.prisma.client.invoice.findMany({
            where: { companyId, ...(status ? { status: status } : {}) },
            include: { client: { select: { companyName: true } }, project: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async createInvoice(companyId, dto) {
        const count = await this.prisma.client.invoice.count({ where: { companyId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
        return this.prisma.client.invoice.create({
            data: { companyId, ...dto, invoiceNumber, amount: dto.amount, status: "DRAFT", dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
        });
    }
    async updateInvoiceStatus(id, status) {
        return this.prisma.client.invoice.update({ where: { id }, data: { status: status, ...(status === "PAID" ? { paidAt: new Date() } : {}) } });
    }
    async findExpenses(companyId) {
        return this.prisma.client.expense.findMany({ where: { companyId }, orderBy: { incurredAt: "desc" } });
    }
    async createExpense(companyId, userId, dto) {
        const expense = await this.prisma.client.expense.create({ data: { companyId, ...dto, incurredAt: new Date(dto.incurredAt) } });
        const approval = await this.approvalsService.createApprovalRequest(companyId, "EXPENSE", "Expense", expense.id, userId);
        return this.prisma.client.expense.update({
            where: { id: expense.id },
            data: { approvalRequestId: approval.id },
        });
    }
    async getRevenueSummary(companyId) {
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
    async findPayroll(userId) {
        return this.prisma.client.payroll.findMany({ where: { userId }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 12 });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        approvals_service_1.ApprovalsService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map