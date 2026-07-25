import { SetMetadata } from "@nestjs/common";
import { AuditAction } from "@prisma/client";

export const AUDIT_METADATA = "audit_metadata";

export interface AuditMetadataOptions {
  action: AuditAction;
  entityType: string;
}

export const Audit = (action: AuditAction, entityType: string) =>
  SetMetadata(AUDIT_METADATA, { action, entityType });
