import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // 회원 가입 API
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
  // 로그인 API
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
  // 프로필 보기 API
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@UserInfo() user: User) {
    return user;
  }
  // 토큰 재발급 API
  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  async refreshToken(@UserInfo() user: User) {
    const tokens = await this.userService.refreshToken(user);
    return {
      status: HttpStatus.CREATED,
      message: '토큰 재발급이 성공하였습니다.',
      data: tokens,
    };
  }
  // 로그 아웃 API
  @UseGuards(AuthGuard('jwt'))
  @Post('sign-out')
  async signOut(@UserInfo() user: User) {
    const loggedOutUserId = await this.userService.signOut(user);
    return {
      status: HttpStatus.OK,
      message: '로그아웃이 성공하였습니다.',
      data: loggedOutUserId,
    };
  }
}
