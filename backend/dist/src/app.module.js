"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const employees_module_1 = require("./employees/employees.module");
const departments_module_1 = require("./departments/departments.module");
const teams_module_1 = require("./teams/teams.module");
const projects_module_1 = require("./projects/projects.module");
const tasks_module_1 = require("./tasks/tasks.module");
const daily_updates_module_1 = require("./daily-updates/daily-updates.module");
const points_module_1 = require("./points/points.module");
const crm_module_1 = require("./crm/crm.module");
const finance_module_1 = require("./finance/finance.module");
const hr_module_1 = require("./hr/hr.module");
const recruitment_module_1 = require("./recruitment/recruitment.module");
const clients_module_1 = require("./clients/clients.module");
const github_module_1 = require("./github/github.module");
const knowledge_base_module_1 = require("./knowledge-base/knowledge-base.module");
const chat_module_1 = require("./chat/chat.module");
const meetings_module_1 = require("./meetings/meetings.module");
const announcements_module_1 = require("./announcements/announcements.module");
const analytics_module_1 = require("./analytics/analytics.module");
const ai_module_1 = require("./ai/ai.module");
const admin_module_1 = require("./admin/admin.module");
const audit_log_interceptor_1 = require("./admin/interceptors/audit-log.interceptor");
const approvals_module_1 = require("./approvals/approvals.module");
const storage_module_1 = require("./storage/storage.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            departments_module_1.DepartmentsModule,
            teams_module_1.TeamsModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            daily_updates_module_1.DailyUpdatesModule,
            points_module_1.PointsModule,
            crm_module_1.CrmModule,
            finance_module_1.FinanceModule,
            hr_module_1.HrModule,
            recruitment_module_1.RecruitmentModule,
            clients_module_1.ClientsModule,
            github_module_1.GithubModule,
            knowledge_base_module_1.KnowledgeBaseModule,
            chat_module_1.ChatModule,
            meetings_module_1.MeetingsModule,
            announcements_module_1.AnnouncementsModule,
            analytics_module_1.AnalyticsModule,
            ai_module_1.AiModule,
            admin_module_1.AdminModule,
            approvals_module_1.ApprovalsModule,
            storage_module_1.StorageModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map