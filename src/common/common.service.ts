import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { pagePaginationDto } from './dto/page-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: pagePaginationDto,
  ) {
    const { take, page } = dto;
    const skip = (page - 1) * take;

    qb.skip(skip).take(take);
  }

  applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { id, order, take } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>' : '<';

      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }

    qb.orderBy(`${qb.alias}.id`, order).take(take);
  }
}
