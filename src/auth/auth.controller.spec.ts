import { Test, TestingModule } from '@nestjs/testing';
import { Role, User } from 'src/user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  tokenBlock: jest.fn(),
  issueToken: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user', async () => {
      const rawToken = 'Basic YXNkQGFzZC5hc2Q6YXNkYXNkYXNk';
      const result = { email: 'asd@asd.asd', password: 'asdasdasd' };

      jest.spyOn(authService, 'register').mockResolvedValue(result as User);

      expect(authController.registerUser(rawToken)).resolves.toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(rawToken);
    });
  });

  describe('loginUser', () => {
    it('should login a user', async () => {
      const rawToken = 'Basic YXNkQGFzZC5hc2Q6YXNkYXNkYXNk';
      const result = {
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(authController.loginUser(rawToken)).resolves.toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(rawToken);
    });
  });

  describe('blockToken', () => {
    it('should block a token', async () => {
      const token = 'mock.token';

      jest.spyOn(authService, 'tokenBlock').mockResolvedValue(true);

      expect(authController.blockToken(token)).resolves.toBe(true);
      expect(authService.tokenBlock).toHaveBeenCalledWith(token);
    });
  });

  describe('rotateAccessToken', () => {
    it('should rotate an access token', async () => {
      const accessToken = 'mock.access.token';

      jest.spyOn(authService, 'issueToken').mockResolvedValue(accessToken);

      const result = await authController.rotateAccessToken({ user: 'a' });

      expect(authService.issueToken).toHaveBeenCalledWith('a', false);
      expect(result).toEqual({ accessToken });
    });
  });

  describe('loginUserPassport', () => {
    it('should login user using passport strategy', async () => {
      const user = { id: 1, role: Role.user };
      const req = { user };
      const accessToken = 'mock.access.token';
      const refreshToken = 'mock.refresh.token';

      jest
        .spyOn(authService, 'issueToken')
        .mockResolvedValueOnce(refreshToken)
        .mockResolvedValueOnce(accessToken);

      const result = await authController.loginUserPassport(req);

      expect(authService.issueToken).toHaveBeenCalledTimes(2);
      expect(authService.issueToken).toHaveBeenNthCalledWith(1, user, true);
      expect(authService.issueToken).toHaveBeenNthCalledWith(2, user, false);
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });
});
