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
exports.HrController = void 0;
const common_1 = require("@nestjs/common");
const hr_service_1 = require("./hr.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HrController = class HrController {
    constructor(hrService) {
        this.hrService = hrService;
    }
    findLeaves(u) { return this.hrService.findLeaveRequests(u.id, u.roleName, u.companyId); }
    createLeave(dto, u) { return this.hrService.createLeaveRequest(u.id, dto); }
    approveLeave(id, status, u) { return this.hrService.approveLeave(id, u.id, status); }
    leaveBalance(u) { return this.hrService.getLeaveBalance(u.id); }
    holidays(u) { return this.hrService.findHolidays(u.companyId); }
    createHoliday(dto, u) { return this.hrService.createHoliday(u.companyId, dto); }
    reviews(userId) { return this.hrService.findPerformanceReviews(userId); }
    createReview(dto, u) { return this.hrService.createPerformanceReview({ ...dto, authorId: u.id }); }
    findTimesheets(u) { return this.hrService.findTimesheets(u.id, u.roleName, u.companyId); }
    submitTimesheet(weekStartDate, u) { return this.hrService.submitTimesheet(u.id, weekStartDate); }
};
exports.HrController = HrController;
__decorate([
    (0, common_1.Get)("leaves"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findLeaves", null);
__decorate([
    (0, common_1.Post)("leaves"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createLeave", null);
__decorate([
    (0, common_1.Patch)("leaves/:id/approve"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("status")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "approveLeave", null);
__decorate([
    (0, common_1.Get)("leave-balance"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "leaveBalance", null);
__decorate([
    (0, common_1.Get)("holidays"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "holidays", null);
__decorate([
    (0, common_1.Post)("holidays"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createHoliday", null);
__decorate([
    (0, common_1.Get)("performance-reviews/:userId"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "reviews", null);
__decorate([
    (0, common_1.Post)("performance-reviews"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)("timesheets"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findTimesheets", null);
__decorate([
    (0, common_1.Post)("timesheets"),
    __param(0, (0, common_1.Body)("weekStartDate")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "submitTimesheet", null);
exports.HrController = HrController = __decorate([
    (0, common_1.Controller)("hr"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [hr_service_1.HrService])
], HrController);
//# sourceMappingURL=hr.controller.js.map