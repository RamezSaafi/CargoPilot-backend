import { Test, TestingModule } from '@nestjs/testing';
import { VehiculesMobileController } from './vehicules-mobile.controller';

describe('VehiculesMobileController', () => {
  let controller: VehiculesMobileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculesMobileController],
    }).compile();

    controller = module.get<VehiculesMobileController>(VehiculesMobileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
