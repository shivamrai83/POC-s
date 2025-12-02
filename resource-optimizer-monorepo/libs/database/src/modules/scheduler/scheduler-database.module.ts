import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export class JobScheduleEntity {

}

export class JobPerformanceEntity {

}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'scheduler',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        schema: configService.get('DB_SCHEDULER_SCHEMA', 'public'),
        entities: [

        ],
        synchronize: configService.get<boolean>('DB_SYNC', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        migrations: [`${__dirname}/migrations/*{.ts,.js}`],
        migrationsRun: true,
      }),
    }),

    TypeOrmModule.forFeature([

    ], 'scheduler'),
  ],
  exports: [TypeOrmModule],
})
export class SchedulerDatabaseModule {}