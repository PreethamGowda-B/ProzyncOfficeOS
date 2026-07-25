import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("finance")
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("invoices") findInvoices(@CurrentUser() u: AuthenticatedUser, @Query("status") status?: string) { return this.financeService.findInvoices(u.companyId, status); }
  @Post("invoices") createInvoice(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.financeService.createInvoice(u.companyId, dto); }
  @Patch("invoices/:id/status") updateInvoiceStatus(@Param("id") id: string, @Body("status") status: string) { return this.financeService.updateInvoiceStatus(id, status); }

  @Get("expenses") findExpenses(@CurrentUser() u: AuthenticatedUser) { return this.financeService.findExpenses(u.companyId); }
  @Post("expenses") createExpense(@Body() dto: any, @CurrentUser() u: AuthenticatedUser) { return this.financeService.createExpense(u.companyId, u.id, dto); }

  @Get("summary") summary(@CurrentUser() u: AuthenticatedUser) { return this.financeService.getRevenueSummary(u.companyId); }
  @Get("payroll") myPayroll(@CurrentUser() u: AuthenticatedUser) { return this.financeService.findPayroll(u.id); }
}
