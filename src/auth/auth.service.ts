import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  parseBasicToken(rawToken: string) {
    // 1) 토큰을 ' ' 기준으로 분리
    // ['Basic', $token]
    const basicSplit = rawToken?.split(' ');

    if (basicSplit.length !== 2)
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');

    const [_, token] = basicSplit;

    // 2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다.
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // email:password
    const tokenSplit = decoded?.split(':');

    if (tokenSplit.length !== 2)
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');

    const [email, password] = tokenSplit;

    return { email, password };
  }

  // rawToken : Basic $token
  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) throw new BadRequestException('이미 가입된 이메일입니다!');

    const hash = await bcrypt.hash(
      password,
      this.configService.get<number>('HASH_ROUNDS'),
    );

    await this.userRepository.save({ email, password: hash });
    return await this.userRepository.findOne({ where: { email } });
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('잘못된 로그인 정보입니다!');

    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) throw new BadRequestException('잘못된 로그인 정보입니다!');

    return user;
  }

  async issueToken(user: User, isRefresh: boolean) {
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    const accessTokenSecret = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET',
    );

    return this.jwtService.signAsync(
      { sub: user.id, role: user.role, type: isRefresh ? 'refresh' : 'access' },
      {
        secret: isRefresh ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefresh ? '24h' : 300,
      },
    );
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.authenticate(email, password);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }
}
