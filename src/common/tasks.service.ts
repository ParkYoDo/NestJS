import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';
import { Movie } from 'src/movie/entities/movie.entity';
import { Repository } from 'typeorm';
import { DefaultLogger } from './logger/default.logger';

@Injectable()
export class TasksService {
  // private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly logger: DefaultLogger,
  ) {}

  // @Cron('*/5 * * * * *')
  // loggerTest() {
  //   this.logger.fatal('1초마다 실행!'); // 치명적 오류
  //   this.logger.error('1초마다 실행!'); // 오류
  //   this.logger.warn('1초마다 실행!'); // 경고
  //   this.logger.log('1초마다 실행!'); // 정보성 로그
  //   this.logger.debug('1초마다 실행!'); // 개발환경 중요 로그
  //   this.logger.verbose('1초마다 실행!'); // 중요X, 궁금해서
  // }

  @Cron('0 0 0 * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));

    const deleteFilesTarget = files.filter((file) => {
      const fileName = parse(file).name;
      const split = fileName.split('_');

      if (split?.length !== 2) return true;

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = 24 * 60 * 60 * 1000;

        const now = +new Date();

        return now - date > aDayInMilSec;
      } catch (e) {
        return true;
      }
    });

    await Promise.all(
      deleteFilesTarget.map((file) =>
        unlink(join(process.cwd(), 'public', 'temp', file)),
      ),
    );
  }

  @Cron('0 * * * * *')
  async calculateMovieLikeCounts() {
    await this.movieRepository.query(`
      UPDATE movie m
      SET "likeCount" = (
	      SELECT count(*) FROM movie_user_like mul
	      WHERE m.id = mul."movieId" AND mul."isLike" = true
      )`);

    await this.movieRepository.query(`
        UPDATE movie m
        SET "dislikeCount" = (
          SELECT count(*) FROM movie_user_like mul
          WHERE m.id = mul."movieId" AND mul."isLike" = false
        )`);
  }

  // @Cron('* * * * * *', { name: 'printer' })
  // printer() {
  //   console.log('print every second');
  // }

  // @Cron('*/5 * * * * *')
  // stopper() {
  //   console.log('--------stopper run--------');

  //   const job = this.schedulerRegistry.getCronJob('printer');

  //   console.log('# lastDate', job.lastDate());
  //   console.log('# nextDate', job.nextDate());
  //   console.log('# Next Dates', job.nextDates(5));

  //   if (job.running) {
  //     job.stop();
  //   } else {
  //     job.start();
  //   }
  // }
}
