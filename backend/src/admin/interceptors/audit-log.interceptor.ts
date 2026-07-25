import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AdminService } from "../admin.service";
import { AUDIT_METADATA, AuditMetadataOptions } from "../decorators/audit.decorator";
import type { AuthenticatedUser } from "../../auth/strategies/jwt.strategy";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminService: AdminService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.getAllAndOverride<AuditMetadataOptions>(
      AUDIT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    const userId = user?.id;
    const beforeValue = request.body;

    return next.handle().pipe(
      tap((response) => {
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
      }),
    );
  }
}
