import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should return user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@gmail.com',
        password: 'password',
      };

      const user = {
        id: 1,
        ...createUserDto,
        password: 'hashedPassword',
      };

      jest.spyOn(userService, 'create').mockResolvedValue(user as User);

      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        { id: 1, email: 'test@gmail.com' },
        { id: 2, email: 'test2@gmail.com' },
      ];

      jest.spyOn(userService, 'findAll').mockResolvedValue(users as User[]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = { id: 1, email: 'test@gmail.com' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);

      const result = await userController.findOne(1);

      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update the updated user', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = { email: 'test@gmail.com' };
      const user = { id, ...updateUserDto };

      jest.spyOn(userService, 'update').mockResolvedValue(user as User);

      const result = await userController.update(id, updateUserDto);

      expect(userService.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = 1;

      jest.spyOn(userService, 'remove').mockResolvedValue(id);

      const result = await userController.remove(id);

      expect(userService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(id);
    });
  });
});
