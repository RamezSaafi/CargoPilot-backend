import { Test, TestingModule } from '@nestjs/testing';
import { VehiculesAdminController } from './vehicules-admin.controller';

describe('VehiculesAdminController', () => {
  let controller: VehiculesAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculesAdminController],
    }).compile();

    controller = module.get<VehiculesAdminController>(VehiculesAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
