import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MovieResolver } from './movie.resolver';
import { MovieService } from './movie.service';

@Module({
  // in this example MovieCommentModule doesn't exist, but
  // you can check the provided source code
  // imports: [forwardRef(() => MovieCommentModule)],
  providers: [MovieResolver, MovieService, PrismaService],
  exports: [MovieResolver, MovieService],
})
export class MovieModule {}