import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { KnowledgeBaseService } from "./knowledge-base.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("kb")
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Get("articles")
  findArticles(
    @CurrentUser() user: AuthenticatedUser,
    @Query("category") category?: string,
    @Query("search") search?: string,
  ) {
    return this.kbService.findArticles(user.companyId, category, search);
  }

  @Get("articles/:id")
  findArticle(@Param("id") id: string) {
    return this.kbService.findArticle(id);
  }

  @Post("articles")
  createArticle(@Body() dto: any, @CurrentUser() user: AuthenticatedUser) {
    return this.kbService.createArticle(user.companyId, user.id, dto);
  }

  @Patch("articles/:id")
  updateArticle(@Param("id") id: string, @Body() dto: any) {
    return this.kbService.updateArticle(id, dto);
  }

  @Delete("articles/:id")
  deleteArticle(@Param("id") id: string) {
    return this.kbService.deleteArticle(id);
  }

  @Get("videos")
  findVideos() {
    return this.kbService.findVideos();
  }

  @Post("videos")
  createVideo(@Body() dto: any) {
    return this.kbService.createVideo(dto);
  }
}
