import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'Admin', email: 'admin@teste.com', password: '123456', role: 'Admin' },
  ];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
}
