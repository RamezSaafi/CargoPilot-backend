import { Test, TestingModule } from '@nestjs/testing';
import { MissionsMobileController } from './missions-mobile.controller';

describe('MissionsMobileController', () => {
  let controller: MissionsMobileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionsMobileController],
    }).compile();

    controller = module.get<MissionsMobileController>(MissionsMobileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
