import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async findChannels(companyId: string) {
    return this.prisma.client.chatChannel.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOrCreateDirectChannel(companyId: string, userA: string, userB: string) {
    // Look for existing direct channel where both participated
    // To simplify: we find any direct channel and filters in app code,
    // or search by a standard name pattern e.g. "direct:userA:userB"
    const channelName1 = `dm:${userA}:${userB}`;
    const channelName2 = `dm:${userB}:${userA}`;

    const existing = await this.prisma.client.chatChannel.findFirst({
      where: {
        companyId,
        type: "DIRECT",
        OR: [
          { name: channelName1 },
          { name: channelName2 },
        ],
      },
    });

    if (existing) return existing;

    return this.prisma.client.chatChannel.create({
      data: {
        companyId,
        type: "DIRECT",
        name: channelName1,
      },
    });
  }

  async createChannel(companyId: string, type: "COMPANY" | "TEAM" | "CLIENT", name: string, teamId?: string) {
    return this.prisma.client.chatChannel.create({
      data: {
        companyId,
        type: type as any,
        name,
        teamId,
      },
    });
  }

  async findMessages(channelId: string, limit = 50) {
    return this.prisma.client.chatMessage.findMany({
      where: { channelId },
      include: {
        sender: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
        senderClient: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async postMessage(channelId: string, body?: string, attachmentUrl?: string, senderUserId?: string, senderClientId?: string) {
    return this.prisma.client.chatMessage.create({
      data: {
        channelId,
        body,
        attachmentUrl,
        senderUserId,
        senderClientId,
      },
      include: {
        sender: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } },
        senderClient: { select: { id: true, companyName: true } },
      },
    });
  }
}
