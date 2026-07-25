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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmployeesService = class EmployeesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** List all employees — optionally scoped by department or team */
    async findAll(filters = {}) {
        const { departmentId, teamId, search } = filters;
        return this.prisma.client.user.findMany({
            where: {
                AND: [
                    departmentId ? { departmentId } : {},
                    teamId ? { teamId } : {},
                    search
                        ? {
                            OR: [
                                { fullName: { contains: search, mode: "insensitive" } },
                                { email: { contains: search, mode: "insensitive" } },
                                { displayName: { contains: search, mode: "insensitive" } },
                            ],
                        }
                        : {},
                ],
            },
            include: {
                role: { select: { name: true } },
                department: { select: { name: true } },
                team: { select: { name: true } },
                profile: { select: { skills: true, experienceYears: true } },
            },
            orderBy: { fullName: "asc" },
        });
    }
    async findOne(id) {
        const user = await this.prisma.client.user.findUnique({
            where: { id },
            include: {
                role: true,
                department: true,
                team: true,
                profile: true,
                equipmentIssued: true,
                promotionHistory: { orderBy: { effectiveDate: "desc" } },
                performanceReviews: {
                    where: { subjectId: id },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
                leaveBalance: true,
                salaryDetails: {
                    orderBy: { effectiveFrom: "desc" },
                    take: 1,
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException(`Employee ${id} not found`);
        return user;
    }
    async updateProfile(id, dto) {
        const { displayName, phone, bio, skills, experienceYears, ...emergencyFields } = dto;
        // Update base user
        if (displayName !== undefined || phone !== undefined) {
            await this.prisma.client.user.update({
                where: { id },
                data: {
                    ...(displayName !== undefined ? { displayName } : {}),
                    ...(phone !== undefined ? { phone } : {}),
                },
            });
        }
        // Upsert EmployeeProfile
        const profileData = {
            ...(bio !== undefined ? { bio } : {}),
            ...(skills !== undefined ? { skills } : {}),
            ...(experienceYears !== undefined ? { experienceYears } : {}),
            ...(emergencyFields.emergencyContactName !== undefined ? { emergencyContactName: emergencyFields.emergencyContactName } : {}),
            ...(emergencyFields.emergencyContactPhone !== undefined ? { emergencyContactPhone: emergencyFields.emergencyContactPhone } : {}),
            ...(emergencyFields.emergencyContactRelation !== undefined ? { emergencyContactRelation: emergencyFields.emergencyContactRelation } : {}),
        };
        if (Object.keys(profileData).length > 0) {
            await this.prisma.client.employeeProfile.upsert({
                where: { userId: id },
                update: profileData,
                create: { userId: id, ...profileData },
            });
        }
        return this.findOne(id);
    }
    async getMe(userId) {
        return this.findOne(userId);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map