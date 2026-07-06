import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

interface AuthenticatedRequest {
  user: { id: number; email: string; refreshToken?: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Login and get JWT tokens' })
  login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Get a new access token using a refresh token' })
  refresh(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ access_token: string }> {
    return this.authService.refresh(req.user.id, req.user.refreshToken ?? '');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate the refresh token' })
  logout(@Request() req: AuthenticatedRequest): Promise<void> {
    return this.authService.logout(req.user.id);
  }
}
