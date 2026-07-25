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
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const admin_service_1 = require("../admin.service");
const audit_decorator_1 = require("../decorators/audit.decorator");
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor(reflector, adminService) {
        this.reflector = reflector;
        this.adminService = adminService;
    }
    intercept(context, next) {
        const auditMeta = this.reflector.getAllAndOverride(audit_decorator_1.AUDIT_METADATA, [context.getHandler(), context.getClass()]);
        if (!auditMeta) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userId = user?.id;
        const beforeValue = request.body;
        return next.handle().pipe((0, operators_1.tap)((response) => {
            this.adminService.logAuditEvent({
                userId,
                action: auditMeta.action,
                entityType: auditMeta.entityType,
                entityId: response?.id || request.params?.id || undefined,
                beforeValue: auditMeta.action === "UPDATE" ? beforeValue : undefined,
                afterValue: response,
                ipAddress: request.ip,
                userAgent: request.headers["user-agent"],
            }).catch((err) => {
                console.error("Failed to log audit event:", err);
            });
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        admin_service_1.AdminService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map