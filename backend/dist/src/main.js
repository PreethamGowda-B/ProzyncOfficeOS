"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, Postman)
            if (!origin)
                return callback(null, true);
            const allowedOrigin = process.env.WEB_APP_URL;
            // In production: only allow the explicit WEB_APP_URL
            if (process.env.NODE_ENV === "production") {
                if (allowedOrigin && origin === allowedOrigin) {
                    return callback(null, true);
                }
                return callback(new Error(`CORS blocked: ${origin}`), false);
            }
            // In development: allow any localhost or 127.0.0.1 port
            if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS blocked: ${origin}`), false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix("api");
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`Prozync OfficeOS API running on http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map