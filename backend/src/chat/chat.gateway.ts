import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { AuthService } from "../auth/auth.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      console.log(`Socket connection rejected: No token provided (${client.id})`);
      client.disconnect(true);
      return;
    }

    const payload = this.authService.verifyAccessToken(token);
    if (!payload) {
      console.log(`Socket connection rejected: Invalid token (${client.id})`);
      client.disconnect(true);
      return;
    }

    client.data = { userId: payload.sub };
    console.log(`Socket connected: ${client.id} (User: ${payload.sub})`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket disconnected: ${client.id} (User: ${client.data?.userId})`);
  }

  @SubscribeMessage("join_channel")
  handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody("channelId") channelId: string) {
    client.join(channelId);
    console.log(`Socket ${client.id} joined channel: ${channelId}`);
    return { status: "ok", channelId };
  }

  @SubscribeMessage("leave_channel")
  handleLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody("channelId") channelId: string) {
    client.leave(channelId);
    console.log(`Socket ${client.id} left channel: ${channelId}`);
    return { status: "ok", channelId };
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      channelId: string;
      body?: string;
      attachmentUrl?: string;
      senderUserId?: string;
      senderClientId?: string;
    },
  ) {
    const message = await this.chatService.postMessage(
      data.channelId,
      data.body,
      data.attachmentUrl,
      data.senderUserId,
      data.senderClientId,
    );

    // Broadcast to the channel room
    this.server.to(data.channelId).emit("new_message", message);
    return message;
  }
}
