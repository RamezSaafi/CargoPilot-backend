import { Test, TestingModule } from '@nestjs/testing';
import { CartesService } from './cartes.service';

describe('CartesService', () => {
  let service: CartesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartesService],
    }).compile();

    service = module.get<CartesService>(CartesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
