import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TelebotService } from 'src/telebot/telebot.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.production'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', '/public')
    }),
  ],
  controllers: [AppController],
  providers: [TelebotService]
})
export class AppModule {}
