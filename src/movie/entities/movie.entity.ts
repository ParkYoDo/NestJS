import { Director } from 'src/director/entities/director.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    cascade: true,
  })
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: true,
  })
  director: Director;
}
