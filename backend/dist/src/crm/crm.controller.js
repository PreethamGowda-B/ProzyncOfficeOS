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
exports.CrmController = void 0;
const common_1 = require("@nestjs/common");
const crm_service_1 = require("./crm.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let CrmController = class CrmController {
    constructor(crmService) {
        this.crmService = crmService;
    }
    findLeads(u) { return this.crmService.findLeads(u.companyId); }
    createLead(dto, u) { return this.crmService.createLead(u.companyId, u.id, dto); }
    updateLeadStatus(id, status) { return this.crmService.updateLeadStatus(id, status); }
    addFollowUp(id, dto) { return this.crmService.addFollowUp(id, dto); }
    findDeals(u) { return this.crmService.findDeals(u.companyId); }
    createDeal(dto, u) { return this.crmService.createDeal(u.companyId, u.id, dto); }
    updateDealStage(id, stage) { return this.crmService.updateDealStage(id, stage); }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Get)("leads"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findLeads", null);
__decorate([
    (0, common_1.Post)("leads"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createLead", null);
__decorate([
    (0, common_1.Patch)("leads/:id/status"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateLeadStatus", null);
__decorate([
    (0, common_1.Post)("leads/:id/follow-ups"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "addFollowUp", null);
__decorate([
    (0, common_1.Get)("deals"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findDeals", null);
__decorate([
    (0, common_1.Post)("deals"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createDeal", null);
__decorate([
    (0, common_1.Patch)("deals/:id/stage"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("stage")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateDealStage", null);
exports.CrmController = CrmController = __decorate([
    (0, common_1.Controller)("crm"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map