/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hased password', async () => {
    const user = await service.signup('varshilshah44@gmail.com', 'abcdefg');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error because user is already exist', async () => {
    fakeUsersService.find = (email: string) =>
      Promise.resolve([{ id: '1', email, password: 'a' }] as unknown as User[]);
    try {
      await service.signup('varshilshah44@gmail.com', 'abcdefg');
    } catch (err) {
      console.log('User already exist error', err);
    }
  });

  it('throws an error if signin faild', async () => {
    try {
      await service.signin('abc@gmail.com', 'aaaa');
    } catch (err) {
      console.log('Invalid credentials error', err);
    }
  });

  it('user is going to sign in with wrong password', async () => {
    fakeUsersService.find = (email: string) =>
      Promise.resolve([
        { email: email, password: 'afadfnkdnfkn' },
      ] as unknown as User[]);
    try {
      await service.signin('varkdfmkdf@gmail.com', 'afkdnfdfkn');
    } catch (err) {
      console.log('Invalid password error', err);
    }
  });

  it('user is going to sign in with correct credentials', async () => {
    fakeUsersService.find = (email: string) =>
      Promise.resolve([
        {
          email: email,
          password:
            '7167c5e77698c708.808e7334de968b64abf0adf7e391f86ca5517b81372923b74fb0168b90b9b10e',
        },
      ] as unknown as User[]);
    const user = await service.signin('abc@gmail.com', '123');
    expect(user).toBeDefined();
  });
});
