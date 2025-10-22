import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MovieResolver } from './movie.resolver';
import { MovieService } from './movie.service';

@Module({
  // imports: [forwardRef(() => MovieCommentModule)],
  providers: [MovieResolver, MovieService, PrismaService],
  exports: [MovieResolver, MovieService],
})
export class MovieModule {}