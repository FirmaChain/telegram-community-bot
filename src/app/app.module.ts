import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelebotService } from 'src/telebot/telebot.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.production'
    }),
  ],
  controllers: [AppController],
  providers: [TelebotService]
})
export class AppModule {}
