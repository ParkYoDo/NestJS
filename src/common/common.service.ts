import { BadRequestException, Injectable } from '@nestjs/common';
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

  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, order, take } = dto;

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
      const cursorObj = JSON.parse(decodedCursor);

      /**
       * {
       *  values: {
       *    id: 1,
       *  },
       *  order: ['id_DESC']
       * }
       */

      order = cursorObj.order;
      const { values } = cursorObj;

      // (column1, column2, column3)  > (value1, value2, value3)
      const columns = Object.keys(values);
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `:${c}`).join(',');

      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    // [id_ASC, likeCount_DESC]
    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');

      if (direction !== 'ASC' && direction !== 'DESC')
        throw new BadRequestException(
          'Order는 ASC 혹은 DESC으로 입력해주세요!',
        );

      if (i === 0) {
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
    }

    qb.take(take);

    const results = await qb.getMany();

    const nextCursor = this.generateNextCursor(results, order);

    return { qb, nextCursor };

    // if (id) {
    //   const direction = order === 'ASC' ? '>' : '<';

    //   qb.where(`${qb.alias}.id ${direction} :id`, { id });
    // }

    // qb.orderBy(`${qb.alias}.id`, order).take(take);
  }

  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) return null;

    /**
     * {
     *  values: {
     *    id: 1,
     *  },
     *  order: ['id_DESC']
     * }
     */

    const lastItem = results[results.length - 1];

    const values = {};

    order.forEach((columnItem) => {
      const [column] = columnItem.split('_');
      values[column] = lastItem[column];
    });

    const cursorOjb = { values, order };
    const nextCursor = Buffer.from(JSON.stringify(cursorOjb)).toString(
      'base64',
    );

    return nextCursor;
  }
}
