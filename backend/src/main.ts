import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix("api");

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Prozync OfficeOS API running on http://localhost:${port}/api`);
}

bootstrap();
