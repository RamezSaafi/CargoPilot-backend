import { Test, TestingModule } from '@nestjs/testing';
import { ClientsAdminController } from './clients-admin.controller';

describe('ClientsAdminController', () => {
  let controller: ClientsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsAdminController],
    }).compile();

    controller = module.get<ClientsAdminController>(ClientsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
