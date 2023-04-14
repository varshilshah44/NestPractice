import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Session,
  UseGuards,
  // ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dtos';
import { UpdateUserDto } from './dtos/update-user.dtos';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dtos';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './users.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
@Serialize(UserDto) // You can also put this to particular method
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    try {
      const { email, password } = body;
      const response = await this.authService.signup(email, password);
      session.userId = response.id;
      return response;
    } catch (err) {
      return err.message ? err.message : 'Something went wrong';
    }
  }

  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    try {
      const { email, password } = body;
      const response = await this.authService.signin(email, password);
      session.userId = response.id;
      return response;
    } catch (err) {
      return err.message ? err.message : 'Something went wrong';
    }
  }

  async findUser(@Param('id') id: string) {
    try {
      const response = await this.usersService.findOne(Number(id));
      return response;
    } catch (err) {
      return err.message ? err.message : 'Something went wrong';
    }
  }

  @Get()
  async findAllUsers(@Query('email') email: string) {
    try {
      const response = await this.usersService.find(email);
      return response;
    } catch (err) {
      return err.message ? err.message : 'Something went wrong';
    }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    try {
      const response = await this.usersService.remove(Number(id));
      return response;
    } catch (err) {
      return err.message ? err.message : 'Something went wrong';
    }
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    try {
      const response = await this.usersService.update(Number(id), body);
      return response;
    } catch (err) {
      return err.message ? err.message : 'Something went wrong';
    }
  }
}
