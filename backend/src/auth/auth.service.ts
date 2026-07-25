import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 30;
const INVITATION_TTL_HOURS = 24;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private signAccessToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId },
      { secret: process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret", expiresIn: ACCESS_TOKEN_TTL },
    );
  }

  private async issueRefreshToken(userId: string, ipAddress?: string, userAgent?: string) {
    const refreshToken = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.client.session.create({
      data: { userId, refreshToken, expiresAt, ipAddress, userAgent },
    });

    return refreshToken;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    // Same generic error whether the email doesn't exist or the password is
    // wrong — don't leak which one it was.
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.prisma.client.deviceLogin.create({
      data: { userId: user.id, ipAddress, device: userAgent },
    });

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = await this.issueRefreshToken(user.id, ipAddress, userAgent);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role.name },
    };
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.client.session.findUnique({ where: { refreshToken } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session expired, please log in again");
    }

    const accessToken = this.signAccessToken(session.userId);
    return { accessToken };
  }

  async logout(refreshToken: string) {
    await this.prisma.client.session.updateMany({
      where: { refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // --- Invitation-based onboarding (replaces emailing temp passwords) ---

  async createInvitation(dto: CreateInvitationDto, invitedById: string, companyId: string) {
    const role = await this.prisma.client.role.findUniqueOrThrow({ where: { name: dto.roleName } });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);

    const invitation = await this.prisma.client.invitation.create({
      data: {
        companyId,
        email: dto.email,
        roleId: role.id,
        departmentId: dto.departmentId,
        teamId: dto.teamId,
        invitedById,
        token,
        expiresAt,
      },
    });

    // TODO: wire to Resend (or your email provider) using the INVITATION
    // EmailTemplate. Logged here so the flow is runnable without one set up.
    console.log(
      `[Invitation email] To: ${dto.email} — accept at ${process.env.WEB_APP_URL ?? "http://localhost:3000"}/accept-invitation?token=${token} (expires in ${INVITATION_TTL_HOURS}h)`,
    );

    return { invitationId: invitation.id, expiresAt: invitation.expiresAt };
  }

  async acceptInvitation(dto: AcceptInvitationDto, ipAddress?: string, userAgent?: string) {
    const invitation = await this.prisma.client.invitation.findUnique({ where: { token: dto.token } });

    if (!invitation) throw new BadRequestException("Invalid invitation link");
    if (invitation.acceptedAt) throw new BadRequestException("This invitation has already been used");
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException("This invitation has expired — ask your admin to send a new one");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          companyId: invitation.companyId,
          email: invitation.email,
          passwordHash,
          fullName: dto.fullName,
          roleId: invitation.roleId,
          departmentId: invitation.departmentId,
          teamId: invitation.teamId,
          status: "ONBOARDING",
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date(), acceptedUserId: created.id },
      });

      return created;
    });

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = await this.issueRefreshToken(user.id, ipAddress, userAgent);

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, fullName: user.fullName } };
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwt.verify(
        token,
        { secret: process.env.JWT_ACCESS_SECRET ?? "dev-only-insecure-secret" }
      );
    } catch {
      return null;
    }
  }
}
