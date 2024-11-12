import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor) // class-validator 사용
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(@Query('title', MovieTitleValidationPipe) title?: string) {
    return this.movieService.findAll(title);
  }

  @Get(':id')
  getMovie(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory(error) {
          throw new BadRequestException('숫자를 입력해주세요!');
        },
      }),
      // ParseFloatPipe,
      // ParseBoolPipe,
      // ParseArrayPipe,
      // ParseUUIDPipe,
      // new ParseEnumPipe(Enum),
    )
    id: number,
    // @Query('test', new DefaultValuePipe(1)) test: number,
  ) {
    return this.movieService.findOne(id);
  }

  @Post()
  postMovie(@Body() body: CreateMovieDto) {
    return this.movieService.create(body);
  }

  @Patch(':id')
  patchMovie(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: string) {
    return this.movieService.remove(+id);
  }
}
