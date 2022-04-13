import { Test, TestingModule } from '@nestjs/testing';
import { TelebotService } from './telebot.service';

describe('TelebotService', () => {
  let service: TelebotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelebotService],
    }).compile();

    service = module.get<TelebotService>(TelebotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
