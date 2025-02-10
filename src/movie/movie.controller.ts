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
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { Role } from 'src/user/entities/user.entity';
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
  getMovies(@Query() dto: GetMovieDto) {
    return this.movieService.findAll(dto);
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'movie', maxCount: 1 },
        { name: 'posterㄴ', maxCount: 2 },
      ],
      {
        limits: {
          fileSize: 20 * 1024 * 1024, // 20 MB
        },
        fileFilter(req, file, callback) {
          console.log(file);
          if (file.mimetype !== 'video/mp4')
            return callback(
              new BadRequestException('MP4 타입만 업로드가 가능합니다!'),
              false,
            );

          return callback(null, true);
        },
      },
    ),
  )
  postMovie(
    @Body() body: CreateMovieDto,
    @Req() req,
    @UploadedFiles()
    files: { movie?: Express.Multer.File[]; poster?: Express.Multer.File[] },
  ) {
    console.log(files);
    return this.movieService.create(body, req.queryRunner);
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
}
