import { Module } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { FinanceController } from "./finance.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ApprovalsModule } from "../approvals/approvals.module";
@Module({ imports: [PrismaModule, ApprovalsModule], controllers: [FinanceController], providers: [FinanceService], exports: [FinanceService] })
export class FinanceModule {}
