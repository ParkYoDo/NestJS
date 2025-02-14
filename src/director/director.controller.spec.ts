import { Test, TestingModule } from '@nestjs/testing';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';

const mockDirectorService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DirectorController', () => {
  let directorController: DirectorController;
  let directorService: DirectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectorController],
      providers: [
        {
          provide: DirectorService,
          useValue: mockDirectorService,
        },
      ],
    }).compile();

    directorController = module.get<DirectorController>(DirectorController);
    directorService = module.get<DirectorService>(DirectorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(directorController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of directors', async () => {
      const result = [{ id: 1, name: 'test' }];

      jest.spyOn(mockDirectorService, 'findAll').mockResolvedValue(result);

      expect(directorController.findAll()).resolves.toEqual(result);
      expect(directorService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a director', async () => {
      const result = { id: 1, name: 'test' };
      jest.spyOn(mockDirectorService, 'findOne').mockResolvedValue(result);

      expect(directorController.findOne(1)).resolves.toEqual(result);
      expect(directorService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a director', async () => {
      const result = { id: 1, name: 'test' };
      jest.spyOn(mockDirectorService, 'create').mockResolvedValue(result);

      expect(
        directorController.create({ name: 'test' } as CreateDirectorDto),
      ).resolves.toEqual(result);
      expect(directorService.create).toHaveBeenCalledWith({ name: 'test' });
    });
  });

  describe('update', () => {
    it('should update a director', async () => {
      const result = { id: 1, name: 'updated' };
      jest.spyOn(mockDirectorService, 'update').mockResolvedValue(result);

      expect(
        directorController.update(1, { name: 'updated' }),
      ).resolves.toEqual(result);
      expect(directorService.update).toHaveBeenCalledWith(1, {
        name: 'updated',
      });
    });
  });

  describe('remove', () => {
    it('should remove a director', async () => {
      const result = 1;
      jest.spyOn(mockDirectorService, 'remove').mockResolvedValue(result);

      expect(directorController.remove(1)).resolves.toEqual(result);
      expect(directorService.remove).toHaveBeenCalledWith(1);
    });
  });
});
