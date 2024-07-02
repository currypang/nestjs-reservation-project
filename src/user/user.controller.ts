import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const savedUser = await this.userService.signUp(
      signUpDto.email,
      signUpDto.nickname,
      signUpDto.password,
    );
    return {
      status: HttpStatus.CREATED,
      message: '회원가입이 성공하였습니다.',
      data: savedUser,
    };
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const tokens = await this.userService.signIn(
      signInDto.email,
      signInDto.password,
    );
    return {
      status: HttpStatus.OK,
      message: '로그인이 성공하였습니다.',
      data: tokens,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@UserInfo() user: User) {
    return user;
  }
}
