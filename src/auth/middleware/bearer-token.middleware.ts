import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariablesKeys } from 'src/common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Basic $token
    // Bearer $token
    const authHeader = req.headers['authorization'];

    if (!authHeader) return next();

    try {
      const token = this.validateBearerToken(authHeader);
      const tokenKey = `Token_${token}`;

      const cachedPayload = await this.cacheManager.get(tokenKey);

      if (cachedPayload) {
        req.user = cachedPayload;
        return next();
      }

      const decodedPayload = this.jwtService.decode(token);

      if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access')
        throw new UnauthorizedException('잘못된 토큰입니다!');

      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariablesKeys.refreshTokenSecret
          : envVariablesKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      // payload['exp'] epoch time seconds
      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +Date.now();

      const differenceInSeconds = (expiryDate - now) / 1000;

      await this.cacheManager.set(
        tokenKey,
        payload,
        Math.max((differenceInSeconds - 30) * 1000, 1),
      );

      req.user = payload;
      next();
    } catch (e) {
      // 토큰이 만료되면 401, 없거나 잘못되면 모두 403
      if (e.name === 'TokenExpiredError')
        throw new UnauthorizedException('토큰이 만료됐습니다!');

      next();
    }
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken?.split(' ');

    if (bearerSplit.length !== 2)
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer')
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');

    return token;
  }
}
