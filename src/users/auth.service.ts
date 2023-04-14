import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async signup(email: string, password: string) {
    const findUserExistResult = await this.userService.find(email);
    if (Array.isArray(findUserExistResult) && findUserExistResult.length) {
      throw new BadRequestException('User already exist');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const finalHash = salt + '.' + hash.toString('hex');

    const result = await this.userService.create(email, finalHash);
    return result;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('Invalid email or password');
    }

    const [salt, hash] = user.password.split('.');
    const newHash = (await scrypt(password, salt, 32)) as Buffer;
    if (!(newHash.toString('hex') === hash)) {
      throw new NotFoundException('Invalid email or password');
    }

    return user;
  }
}
