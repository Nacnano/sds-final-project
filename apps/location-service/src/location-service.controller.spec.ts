import { Test, TestingModule } from '@nestjs/testing';
import { LocationServiceController } from './location-service.controller';
import { LocationService } from './location-service.service';
    
describe('LocationServiceController', () => {
  let locationServiceController: LocationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LocationServiceController],
      providers: [LocationService],
    }).compile();

    locationServiceController = app.get<LocationServiceController>(LocationServiceController);
  });
});
