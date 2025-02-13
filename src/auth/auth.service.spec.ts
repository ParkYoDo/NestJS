import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role, User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockJwtService = {
  decode: jest.fn(),
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockCacheManager = {
  set: jest.fn(),
};

const mockUserService = {
  create: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let userService: UserService;
  let configService: ConfigService;
  let jwtService: JwtService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },

        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('tokenBlock', () => {
    it('should block a token', async () => {
      const token = 'token';
      const payload = { exp: Math.floor(Date.now() / 1000) + 60 };

      jest.spyOn(jwtService, 'decode').mockReturnValue(payload);

      await authService.tokenBlock(token);

      expect(jwtService.decode).toHaveBeenCalledWith(token);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `BLOCK_TOKEN_${token}`,
        payload,
        expect.any(Number),
      );
    });
  });

  describe('parseBasicToken', () => {
    it('should parse a valid basic token', () => {
      const rawToken = 'Basic YXNkQGFzZC5hc2Q6YXNkYXNkYXNk';
      const decoded = { email: 'asd@asd.asd', password: 'asdasdasd' };

      const result = authService.parseBasicToken(rawToken);

      expect(result).toEqual(decoded);
    });

    it('should throw an error for invalid basic token format', async () => {
      const rawToken = 'invalidToken';

      expect(() => authService.parseBasicToken(rawToken)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid basic token format', async () => {
      const rawToken = 'Bearer invalidToken';

      expect(() => authService.parseBasicToken(rawToken)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid basic token format', async () => {
      const rawToken = 'Basic a';

      expect(() => authService.parseBasicToken(rawToken)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseBearerToken', () => {
    it('should parse a valid bearer token', async () => {
      const rawToken = 'Bearer token';
      const payload = { type: 'access' };

      jest.spyOn(mockJwtService, 'verifyAsync').mockResolvedValue(payload);
      jest.spyOn(mockConfigService, 'get').mockReturnValue('secret');

      const result = await authService.parseBearerToken(rawToken, false);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
        secret: 'secret',
      });
      expect(result).toEqual(payload);
    });

    it('should throw an error for invalid bearer token format', async () => {
      const rawToken = 'a';

      expect(authService.parseBearerToken(rawToken, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid bearer token format', async () => {
      const rawToken = 'Basic token';

      expect(authService.parseBearerToken(rawToken, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid bearer token format', async () => {
      const rawToken = 'Bearer token';

      jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({ type: 'refresh' });

      expect(authService.parseBearerToken(rawToken, false)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error for invalid bearer token format', async () => {
      const rawToken = 'Bearer token';

      jest
        .spyOn(mockJwtService, 'verifyAsync')
        .mockResolvedValue({ type: 'access' });

      expect(authService.parseBearerToken(rawToken, true)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const rawToken = 'Basic YXNkQGFzZC5hc2Q6YXNkYXNkYXNk';
      const user = { email: 'asd@asd.asd', password: 'asdasdasd' };

      jest.spyOn(authService, 'parseBasicToken').mockReturnValue(user);
      jest.spyOn(mockUserService, 'create').mockResolvedValue(user);

      const result = await authService.register(rawToken);

      expect(authService.parseBasicToken).toHaveBeenCalledWith(rawToken);
      expect(mockUserService.create).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user with correct credentials', async () => {
      const email = 'asd@asd.asd';
      const password = 'asdasdasd';
      const user = { email, password: 'hashedPassword' };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((password, hashedPassword) => true);

      const result = await authService.authenticate(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, 'hashedPassword');
      expect(result).toEqual(user);
    });

    it('should throw an error for incorrect credentials', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(
        authService.authenticate('asd@asd.asd', 'asdasdasd'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error for incorrect credentials', async () => {
      const user = { email: 'asd@asd.asd', password: 'hashedPassword' };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((password, hashedPassword) => false);

      expect(
        authService.authenticate('asd@asd.asd', '123123123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('issueToken', () => {
    const user = { id: 1, role: Role.user };
    const token = 'token';

    beforeEach(() => {
      jest.spyOn(mockConfigService, 'get').mockReturnValue('secret');
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValue(token);
    });

    it('should issue an access token', async () => {
      const result = await authService.issueToken(user as User, false);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, role: user.role, type: 'access' },
        {
          secret: 'secret',
          expiresIn: 300,
        },
      );
      expect(result).toEqual('token');
    });

    it('should issue a refresh token', async () => {
      const result = await authService.issueToken(user as User, true);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, role: user.role, type: 'refresh' },
        {
          secret: 'secret',
          expiresIn: '24h',
        },
      );
      expect(result).toEqual('token');
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const rawToken = 'Basic YXNkQGFzZC5hc2Q6YXNkYXNkYXNk';
      const email = 'asd@asd.asd';
      const password = 'asdasdasd';
      const user = { id: 1, role: Role.user };

      jest.spyOn(authService, 'parseBasicToken').mockReturnValue({
        email,
        password,
      });
      jest.spyOn(authService, 'authenticate').mockResolvedValue(user as User);
      jest.spyOn(authService, 'issueToken').mockResolvedValue('token');

      const result = await authService.login(rawToken);

      expect(authService.parseBasicToken).toHaveBeenCalledWith(rawToken);
      expect(authService.authenticate).toHaveBeenCalledWith(email, password);
      expect(authService.issueToken).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
      });
    });
  });
});
