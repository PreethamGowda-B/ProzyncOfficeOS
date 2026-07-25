import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RoleName } from "@prisma/client";
import type { AuthenticatedUser } from "./strategies/jwt.strategy";

const REFRESH_COOKIE_NAME = "officeos_refresh_token";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/auth",
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto,
      req.ip,
      req.headers["user-agent"],
    );
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken, user };
  }

  @Post("refresh")
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) throw new UnauthorizedException("No refresh token");
    return this.authService.refresh(refreshToken);
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) await this.authService.logout(refreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    return { success: true };
  }

  // Only Super Admin / Company Admin / HR Manager can invite new employees —
  // this is the only way a User row gets created (no public signup).
  @Post("invite")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COMPANY_ADMIN, RoleName.HR_MANAGER)
  async invite(@Body() dto: CreateInvitationDto, @CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.createInvitation(dto, currentUser.id, currentUser.companyId);
  }

  @Post("accept-invitation")
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.acceptInvitation(
      dto,
      req.ip,
      req.headers["user-agent"],
    );
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    return { accessToken, user };
  }
}
