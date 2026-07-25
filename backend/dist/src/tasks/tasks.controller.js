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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const audit_decorator_1 = require("../admin/decorators/audit.decorator");
const client_1 = require("@prisma/client");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    findAll(user, projectId, status, priority, assigneeId) {
        return this.tasksService.findAll(user.id, user.roleName, { projectId, status, priority, assigneeId });
    }
    findOne(id) {
        return this.tasksService.findOne(id);
    }
    create(dto, user) {
        return this.tasksService.create({ ...dto, creatorId: user.id });
    }
    update(id, dto) {
        return this.tasksService.update(id, dto);
    }
    updateStatus(id, status, user) {
        return this.tasksService.updateStatus(id, status, user.id);
    }
    addComment(id, body, user) {
        return this.tasksService.addComment(id, user.id, body);
    }
    logTime(id, dto, user) {
        return this.tasksService.logTime(id, user.id, dto);
    }
    addDependency(id, dependsOnTaskId) {
        return this.tasksService.addDependency(id, dependsOnTaskId);
    }
    removeDependency(id, dependsOnTaskId) {
        return this.tasksService.removeDependency(id, dependsOnTaskId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)("projectId")),
    __param(2, (0, common_1.Query)("status")),
    __param(3, (0, common_1.Query)("priority")),
    __param(4, (0, common_1.Query)("assigneeId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, audit_decorator_1.Audit)(client_1.AuditAction.CREATE, "Task"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, audit_decorator_1.Audit)(client_1.AuditAction.UPDATE, "Task"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, audit_decorator_1.Audit)(client_1.AuditAction.UPDATE, "Task"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("status")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(":id/comments"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("body")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(":id/time-logs"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "logTime", null);
__decorate([
    (0, common_1.Post)(":id/dependencies"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("dependsOnTaskId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "addDependency", null);
__decorate([
    (0, common_1.Delete)(":id/dependencies/:dependsOnTaskId"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("dependsOnTaskId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "removeDependency", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)("tasks"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map