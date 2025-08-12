import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MovieModule } from './movie/movie.module';
 
@Module({
 imports: [
   GraphQLModule.forRoot<ApolloDriverConfig>({
     driver: ApolloDriver,
 
     // to generate schema from @ObjectType() class
     autoSchemaFile: true,
   }),
   MovieModule,
 ],
})
export class AppModule {}