import { Module } from "@nestjs/common";
import { DailyUpdatesService } from "./daily-updates.service";
import { DailyUpdatesController } from "./daily-updates.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DailyUpdatesController],
  providers: [DailyUpdatesService],
  exports: [DailyUpdatesService],
})
export class DailyUpdatesModule {}
