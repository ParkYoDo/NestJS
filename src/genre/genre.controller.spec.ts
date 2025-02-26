import { Test, TestingModule } from '@nestjs/testing';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Genre } from './entities/genre.entity';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';

const mockGenreService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GenreController', () => {
  let genreController: GenreController;
  let genreService: GenreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [{ provide: GenreService, useValue: mockGenreService }],
    }).compile();

    genreController = module.get<GenreController>(GenreController);
    genreService = module.get<GenreService>(GenreService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(genreController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {
      const genres = [{ id: 1, name: 'test' }] as Genre[];

      jest.spyOn(genreService, 'findAll').mockResolvedValue(genres);

      expect(genreController.findAll()).resolves.toEqual(genres);
      expect(genreService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a genre', async () => {
      const genre = { id: 1, name: 'test' } as Genre;

      jest.spyOn(genreService, 'findOne').mockResolvedValue(genre);

      expect(genreController.findOne(genre.id)).resolves.toEqual(genre);
      expect(genreService.findOne).toHaveBeenCalledWith(genre.id);
    });
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const createGenreDto = { name: 'test' };
      const result = { id: 1, ...createGenreDto };

      jest
        .spyOn(genreService, 'create')
        .mockResolvedValue(result as CreateGenreDto & Genre);

      expect(genreController.create(createGenreDto)).resolves.toEqual(result);
      expect(genreService.create).toHaveBeenCalledWith(createGenreDto);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const genre = { id: 1, name: 'test' } as Genre;

      jest.spyOn(genreService, 'update').mockResolvedValue(genre);

      expect(
        genreController.update(genre.id, { name: 'test' }),
      ).resolves.toEqual(genre);
      expect(genreService.update).toHaveBeenCalledWith(genre.id, {
        name: 'test',
      });
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      const genre = { id: 1, name: 'test' } as Genre;

      jest.spyOn(genreService, 'remove').mockResolvedValue(genre.id);

      expect(genreController.remove(genre.id)).resolves.toEqual(genre.id);
      expect(genreService.remove).toHaveBeenCalledWith(genre.id);
    });
  });
});
