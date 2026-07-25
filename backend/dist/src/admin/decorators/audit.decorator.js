"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audit = exports.AUDIT_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_METADATA = "audit_metadata";
const Audit = (action, entityType) => (0, common_1.SetMetadata)(exports.AUDIT_METADATA, { action, entityType });
exports.Audit = Audit;
//# sourceMappingURL=audit.decorator.js.map