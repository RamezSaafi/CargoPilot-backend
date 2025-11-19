import { Test, TestingModule } from '@nestjs/testing';
import { ChauffeursAdminController } from './chauffeurs-admin.controller';

describe('ChauffeursAdminController', () => {
  let controller: ChauffeursAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChauffeursAdminController],
    }).compile();

    controller = module.get<ChauffeursAdminController>(ChauffeursAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
