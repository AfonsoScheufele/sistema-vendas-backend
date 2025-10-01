import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  @Get()
  @Roles('Admin')
  findAll() {
    return [
      { id: 1, name: 'Admin', email: 'admin@teste.com', role: 'Admin' },
      { id: 2, name: 'User', email: 'user@teste.com', role: 'User' },
    ];
  }
}
