import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
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
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { Role } from 'src/user/entities/user.entity';
import { QueryRunner as QR } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { GetMovieDto } from './dto/get-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor) // class-validator 사용
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  getMovies(@Query() dto: GetMovieDto, @UserId() userId?: number) {
    return this.movieService.findAll(dto, userId);
  }

  @Get('recent')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('getMoviesRecent')
  @CacheTTL(10 * 1000)
  getMoviesRecent() {
    return this.movieService.findRecent();
  }

  @Get(':id')
  @Public()
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
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @UserId() userId: number,
    @QueryRunner() queryRunner: QR,
  ) {
    return this.movieService.create(body, userId, queryRunner);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: string) {
    return this.movieService.remove(+id);
  }

  /**
   * [Like Button] [Dislike Button]
   *
   * 아무것도 누르지 않은 상태
   * Like & Dislike
   *
   * Like 버튼 누르면 Like 버튼 불 켜짐
   *
   * Like 버튼 다시 누르면 Like 버튼 불 꺼짐
   *
   * Dislike 버튼 누르면 Dislike 버튼 불 켜짐
   *
   * Dislike 버튼 다시 누르면 Dislike 버튼 불 꺼짐
   *
   * Like 버튼 누름 Like 버튼 불 켜짐 -> Dislike 버튼 누르면 Like 버튼 불 꺼지고 Dislike 버튼 불 켜짐
   */

  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
