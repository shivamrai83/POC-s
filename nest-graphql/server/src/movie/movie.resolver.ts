import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { MovieInputCreate } from './movie.input';
import { Movie as GqlMovie } from './movie.model';
import { MovieService } from './movie.service';
import type { Movie as PrismaMovie } from '@prisma/client';

@Resolver(() => GqlMovie)
export class MovieResolver {
  constructor(
    private movieService: MovieService,
  ) {}

  @Query(() => [GqlMovie])
  async getAllMovies(): Promise<PrismaMovie[]> {
    return this.movieService.getAllMovies();
  }

  @Query(() => GqlMovie)
  async getMovieById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PrismaMovie> {
    return this.movieService.getMovieById(id);
  }

  @Mutation(() => GqlMovie)
  async createMovie(
    @Args('movieInputCreate') movieInputCreate: MovieInputCreate,
  ): Promise<PrismaMovie> {
    return this.movieService.createMovie(movieInputCreate);
  }

  @ResolveField('movieComment', () => [String])
  async getMovieComment(@Parent() movie: PrismaMovie) {
    return ['Test1', 'Test2'];
  }
}
