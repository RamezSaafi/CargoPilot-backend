import { Test, TestingModule } from '@nestjs/testing';
import { ContactPublicController } from './contact-public.controller';

describe('ContactPublicController', () => {
  let controller: ContactPublicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactPublicController],
    }).compile();

    controller = module.get<ContactPublicController>(ContactPublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
