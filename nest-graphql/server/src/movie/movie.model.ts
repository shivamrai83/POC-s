import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Movie {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  title: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [String])
  movieComment?: string[];
}
