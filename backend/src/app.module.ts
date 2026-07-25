import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EmployeesModule } from "./employees/employees.module";
import { DepartmentsModule } from "./departments/departments.module";
import { TeamsModule } from "./teams/teams.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { DailyUpdatesModule } from "./daily-updates/daily-updates.module";
import { PointsModule } from "./points/points.module";
import { CrmModule } from "./crm/crm.module";
import { FinanceModule } from "./finance/finance.module";
import { HrModule } from "./hr/hr.module";
import { RecruitmentModule } from "./recruitment/recruitment.module";
import { ClientsModule } from "./clients/clients.module";
import { GithubModule } from "./github/github.module";
import { KnowledgeBaseModule } from "./knowledge-base/knowledge-base.module";
import { ChatModule } from "./chat/chat.module";
import { MeetingsModule } from "./meetings/meetings.module";
import { AnnouncementsModule } from "./announcements/announcements.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AiModule } from "./ai/ai.module";
import { AdminModule } from "./admin/admin.module";
import { AuditLogInterceptor } from "./admin/interceptors/audit-log.interceptor";
import { ApprovalsModule } from "./approvals/approvals.module";
import { StorageModule } from "./storage/storage.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    DailyUpdatesModule,
    PointsModule,
    CrmModule,
    FinanceModule,
    HrModule,
    RecruitmentModule,
    ClientsModule,
    GithubModule,
    KnowledgeBaseModule,
    ChatModule,
    MeetingsModule,
    AnnouncementsModule,
    AnalyticsModule,
    AiModule,
    AdminModule,
    ApprovalsModule,
    StorageModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
