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

      const allowedOrigins: string[] = [
        process.env.WEB_APP_URL,
        "https://prozync-office-os.vercel.app",
      ].filter(Boolean) as string[];

      // Always allow localhost in any environment
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview deployment for this project
      if (/^https:\/\/prozync-office-os.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
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
