import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/tokens.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  // 회원가입 로직
  async signUp(email: string, nickname: string, password: string) {
    // 이메일 중복시 오류 처리
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
      );
    }
    // 닉네임 중복시 오류 처리
    const existingNickname = await this.userRepository.findOne({
      where: { nickname },
    });
    if (existingNickname) {
      throw new ConflictException(
        '이미 해당 닉네임으로 가입된 사용자가 있습니다!',
      );
    }
    // 비밀번호는 해쉬하여 db에 저장
    const hashedPassword = await hash(password, 10);
    const savedUser = await this.userRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
  // 로그인 로직
  async signIn(email: string, password: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });
    if (_.isNil(user)) {
      throw new NotFoundException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }
    const payload = { email, sub: user.id };
    const tokens = {
      accessToken: this.jwtService.sign(payload, { expiresIn: '12h' }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
        expiresIn: '7d',
      }),
    };
    // upsert 사용 시 conflictPaths를 인자로 넣어 줘야함. 필드명은 DB가 아닌 typeorm 코드 기준
    await this.tokenRepository.upsert(
      {
        userId: user.id,
        refreshToken: tokens.refreshToken,
      },
      ['userId'],
    );
    return tokens;
  }
  // 이메일로 유저정보 확인 로직
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
}
