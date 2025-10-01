import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    if (email === 'teste@teste.com' && pass === '123456') {
      return { userId: 1, email, role: 'Admin' };
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.userId, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refresh(user: any) {
    const payload = { sub: user.sub, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    };
  }
}
