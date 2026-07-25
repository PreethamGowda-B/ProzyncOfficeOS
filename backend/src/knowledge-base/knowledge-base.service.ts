import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findArticles(companyId: string, category?: string, search?: string) {
    return this.prisma.client.knowledgeBaseArticle.findMany({
      where: {
        companyId,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findArticle(id: string) {
    const article = await this.prisma.client.knowledgeBaseArticle.findUnique({
      where: { id },
    });
    if (!article) throw new NotFoundException(`Knowledge base article ${id} not found`);
    return article;
  }

  async createArticle(companyId: string, createdById: string, dto: { title: string; category: string; content: string; tags?: string[] }) {
    return this.prisma.client.knowledgeBaseArticle.create({
      data: {
        companyId,
        createdById,
        title: dto.title,
        category: dto.category,
        content: dto.content,
        tags: dto.tags ?? [],
      },
    });
  }

  async updateArticle(id: string, dto: Partial<{ title: string; category: string; content: string; tags: string[] }>) {
    return this.prisma.client.knowledgeBaseArticle.update({
      where: { id },
      data: dto,
    });
  }

  async deleteArticle(id: string) {
    return this.prisma.client.knowledgeBaseArticle.delete({
      where: { id },
    });
  }

  // --- Training Videos ---
  async findVideos() {
    return this.prisma.client.trainingVideo.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async createVideo(dto: { title: string; description?: string; storageKey: string; durationSeconds?: number }) {
    return this.prisma.client.trainingVideo.create({
      data: dto,
    });
  }
}
