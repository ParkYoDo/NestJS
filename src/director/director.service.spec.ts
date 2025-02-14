import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { Director } from './entities/director.entity';

const mockDirectorRepository = {
  find: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('DirectorService', () => {
  let directorService: DirectorService;
  let directorRepository: Repository<Director>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectorService,
        {
          provide: getRepositoryToken(Director),
          useValue: mockDirectorRepository,
        },
      ],
    }).compile();

    directorService = module.get<DirectorService>(DirectorService);
    directorRepository = module.get<Repository<Director>>(
      getRepositoryToken(Director),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(directorService).toBeDefined();
  });

  describe('create', () => {
    it('should create a director', async () => {
      const createDirectorDto = {
        name: 'test',
      };

      jest
        .spyOn(mockDirectorRepository, 'save')
        .mockResolvedValue(createDirectorDto);

      const result = await directorService.create(
        createDirectorDto as CreateDirectorDto,
      );

      expect(mockDirectorRepository.save).toHaveBeenCalledWith(
        createDirectorDto,
      );
      expect(result).toEqual(createDirectorDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of directors', async () => {
      const directors = [{ id: 1, name: 'test' }];
      const count = 1;

      jest.spyOn(mockDirectorRepository, 'find').mockResolvedValue(directors);
      jest.spyOn(mockDirectorRepository, 'count').mockResolvedValue(count);

      const result = await directorService.findAll();

      expect(mockDirectorRepository.find).toHaveBeenCalled();
      expect(mockDirectorRepository.count).toHaveBeenCalled();
      expect(result).toEqual([directors, count]);
    });
  });

  describe('findOne', () => {
    it('should return a director', async () => {
      const director = { id: 1, name: 'test' };

      jest
        .spyOn(mockDirectorRepository, 'findOne')
        .mockResolvedValue(director as Director);

      const result = await directorService.findOne(director.id);

      expect(mockDirectorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(director);
    });

    it('should throw an error if the director is not found', async () => {
      const id = 1;

      jest.spyOn(mockDirectorRepository, 'findOne').mockResolvedValue(null);

      expect(directorService.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a director', async () => {
      const updateDirectorDto = {
        name: 'test',
      };
      const existingDirector = { id: 1, name: 'test' };
      const updatedDirector = { id: 1, name: 'updated' };

      jest
        .spyOn(mockDirectorRepository, 'findOne')
        .mockResolvedValueOnce(existingDirector)
        .mockResolvedValueOnce(updatedDirector);

      const result = await directorService.update(1, updateDirectorDto);

      expect(mockDirectorRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockDirectorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockDirectorRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        updateDirectorDto,
      );
      expect(result).toEqual(updatedDirector);
    });

    it('should throw an error if the director is not found', async () => {
      jest.spyOn(mockDirectorRepository, 'findOne').mockResolvedValue(null);

      expect(directorService.update(1, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a director', async () => {
      const existingDirector = { id: 1, name: 'test' };

      jest
        .spyOn(mockDirectorRepository, 'findOne')
        .mockResolvedValue(existingDirector);

      const result = await directorService.remove(existingDirector.id);

      expect(directorRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingDirector.id },
      });
      expect(directorRepository.delete).toHaveBeenCalledWith(
        existingDirector.id,
      );
      expect(result).toEqual(existingDirector.id);
    });

    it('should throw an error if the director is not found', async () => {
      jest.spyOn(mockDirectorRepository, 'findOne').mockResolvedValue(null);

      expect(directorService.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
