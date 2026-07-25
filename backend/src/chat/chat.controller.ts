import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels")
  findChannels(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.findChannels(user.companyId);
  }

  @Post("channels")
  createChannel(
    @Body() dto: { type: "COMPANY" | "TEAM" | "CLIENT"; name: string; teamId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.createChannel(user.companyId, dto.type, dto.name, dto.teamId);
  }

  @Post("channels/direct")
  createDirectChannel(@Body("targetUserId") targetUserId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.chatService.findOrCreateDirectChannel(user.companyId, user.id, targetUserId);
  }

  @Get("channels/:id/messages")
  findMessages(@Param("id") channelId: string, @Query("limit") limit?: string) {
    return this.chatService.findMessages(channelId, limit ? parseInt(limit) : undefined);
  }

  @Post("channels/:id/messages")
  sendMessage(
    @Param("id") channelId: string,
    @Body("body") body: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.postMessage(channelId, body, undefined, user.id);
  }
}
