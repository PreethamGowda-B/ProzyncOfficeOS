import { Module } from "@nestjs/common";
import { HrService } from "./hr.service";
import { HrController } from "./hr.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { ApprovalsModule } from "../approvals/approvals.module";
@Module({ imports: [PrismaModule, ApprovalsModule], controllers: [HrController], providers: [HrService], exports: [HrService] })
export class HrModule {}
