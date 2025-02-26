import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { GenreService } from './genre.service';
import { NotFoundException } from '@nestjs/common';

const mockGenreRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('GenreService', () => {
  let genreService: GenreService;
  let genreRepository: Repository<Genre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepository,
        },
      ],
    }).compile();

    genreService = module.get<GenreService>(GenreService);
    genreRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(genreService).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const createGenreDto = {
        name: 'test',
      };
      const savedGenre = { id: 1, ...createGenreDto };

      jest
        .spyOn(genreRepository, 'save')
        .mockResolvedValue(savedGenre as Genre);

      const result = await genreService.create(createGenreDto);

      expect(genreRepository.save).toHaveBeenCalledWith(createGenreDto);
      expect(result).toEqual(savedGenre);
    });
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      const genres = [{ id: 1, name: 'test' }];

      jest.spyOn(genreRepository, 'find').mockResolvedValue(genres as Genre[]);

      const result = await genreService.findAll();

      expect(genreRepository.find).toHaveBeenCalled();
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre', async () => {
      const genre = { id: 1, name: 'test' };

      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(genre as Genre);

      const result = await genreService.findOne(genre.id);

      expect(genreRepository.findOne).toHaveBeenCalledWith({
        where: { id: genre.id },
      });
      expect(result).toEqual(genre);
    });

    it('should throw an error if the genre does not exist', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);

      expect(genreService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const updateGenreDto = { name: 'test' };
      const existingGenre = { id: 1, name: 'test' };
      const updatedGenre = { id: 1, ...updateGenreDto };

      jest
        .spyOn(genreRepository, 'findOne')
        .mockResolvedValueOnce(existingGenre as Genre);
      jest
        .spyOn(genreRepository, 'findOne')
        .mockResolvedValueOnce(updatedGenre as Genre);

      const result = await genreService.update(1, updateGenreDto);

      expect(genreRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(genreRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        updateGenreDto,
      );
      expect(result).toEqual(updatedGenre);
    });

    it('should throw an error if the genre does not exist', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);

      expect(genreService.update(1, { name: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      const genre = { id: 1, name: 'test' };

      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(genre as Genre);

      const result = await genreService.remove(genre.id);

      expect(genreRepository.findOne).toHaveBeenCalledWith({
        where: { id: genre.id },
      });
      expect(genreRepository.delete).toHaveBeenCalledWith(genre.id);
      expect(result).toBe(genre.id);
    });

    it('should throw an error if the genre does not exist', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);

      expect(genreService.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
