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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MeetingsService = class MeetingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUpcoming(userId) {
        return this.prisma.client.meeting.findMany({
            where: {
                OR: [
                    { organizerId: userId },
                    { attendees: { some: { userId } } },
                ],
                scheduledAt: { gte: new Date() },
            },
            include: {
                organizer: { select: { id: true, fullName: true, avatarUrl: true } },
                attendees: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
            },
            orderBy: { scheduledAt: "asc" },
        });
    }
    async create(organizerId, dto) {
        const meeting = await this.prisma.client.meeting.create({
            data: {
                title: dto.title,
                organizerId,
                scheduledAt: new Date(dto.scheduledAt),
                durationMinutes: dto.durationMinutes ?? 30,
                meetingLink: dto.meetingLink,
            },
        });
        if (dto.attendeeIds && dto.attendeeIds.length > 0) {
            const attendees = dto.attendeeIds.map((userId) => ({
                meetingId: meeting.id,
                userId,
            }));
            await this.prisma.client.meetingAttendee.createMany({ data: attendees });
        }
        return meeting;
    }
    async updateAttendance(meetingId, userId, attended) {
        const record = await this.prisma.client.meetingAttendee.findUnique({
            where: { meetingId_userId: { meetingId, userId } },
        });
        if (!record)
            throw new common_1.NotFoundException("Attendee registration not found for this meeting");
        const updated = await this.prisma.client.meetingAttendee.update({
            where: { id: record.id },
            data: { attended },
        });
        // Deduct -2 points if they missed the meeting
        if (!attended) {
            await this.prisma.client.pointsLedgerEntry.create({
                data: {
                    userId,
                    reason: "MISSED_MEETING",
                    points: -2,
                    referenceType: "Meeting",
                    referenceId: meetingId,
                },
            });
        }
        return updated;
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map