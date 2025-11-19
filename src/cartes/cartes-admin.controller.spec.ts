import { Test, TestingModule } from '@nestjs/testing';
import { CartesAdminController } from './cartes-admin.controller';

describe('CartesAdminController', () => {
  let controller: CartesAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartesAdminController],
    }).compile();

    controller = module.get<CartesAdminController>(CartesAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
