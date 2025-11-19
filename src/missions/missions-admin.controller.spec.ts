import { Test, TestingModule } from '@nestjs/testing';
import { MissionsAdminController } from './missions-admin.controller';

describe('MissionsAdminController', () => {
  let controller: MissionsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionsAdminController],
    }).compile();

    controller = module.get<MissionsAdminController>(MissionsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
