import { IsOptional, IsString } from 'class-validator';
import { pagePaginationDto } from 'src/common/dto/page-pagination.dto';

export class GetMovieDto extends pagePaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
