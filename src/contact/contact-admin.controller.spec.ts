import { Test, TestingModule } from '@nestjs/testing';
import { ContactAdminController } from './contact-admin.controller';

describe('ContactAdminController', () => {
  let controller: ContactAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactAdminController],
    }).compile();

    controller = module.get<ContactAdminController>(ContactAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
