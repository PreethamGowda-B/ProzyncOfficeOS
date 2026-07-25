"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const auth_service_1 = require("../auth/auth.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, authService) {
        this.chatService = chatService;
        this.authService = authService;
    }
    async handleConnection(client) {
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
    handleDisconnect(client) {
        console.log(`Socket disconnected: ${client.id} (User: ${client.data?.userId})`);
    }
    handleJoinChannel(client, channelId) {
        client.join(channelId);
        console.log(`Socket ${client.id} joined channel: ${channelId}`);
        return { status: "ok", channelId };
    }
    handleLeaveChannel(client, channelId) {
        client.leave(channelId);
        console.log(`Socket ${client.id} left channel: ${channelId}`);
        return { status: "ok", channelId };
    }
    async handleSendMessage(client, data) {
        const message = await this.chatService.postMessage(data.channelId, data.body, data.attachmentUrl, data.senderUserId, data.senderClientId);
        // Broadcast to the channel room
        this.server.to(data.channelId).emit("new_message", message);
        return message;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("join_channel"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)("channelId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leave_channel"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)("channelId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("send_message"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        auth_service_1.AuthService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map