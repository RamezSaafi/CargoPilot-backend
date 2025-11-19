import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsMobileController } from './incidents-mobile.controller';

describe('IncidentsMobileController', () => {
  let controller: IncidentsMobileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentsMobileController],
    }).compile();

    controller = module.get<IncidentsMobileController>(IncidentsMobileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
