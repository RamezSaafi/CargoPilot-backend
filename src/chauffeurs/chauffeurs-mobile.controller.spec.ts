import { Test, TestingModule } from '@nestjs/testing';
import { ChauffeursMobileController } from './chauffeurs-mobile.controller';

describe('ChauffeursMobileController', () => {
  let controller: ChauffeursMobileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChauffeursMobileController],
    }).compile();

    controller = module.get<ChauffeursMobileController>(ChauffeursMobileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
