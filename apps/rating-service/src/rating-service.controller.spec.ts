import { Test, TestingModule } from '@nestjs/testing';
import { RatingServiceController } from './rating-service.controller';
import { RatingServiceService } from './rating-service.service';

describe('RatingServiceController', () => {
  let ratingServiceController: RatingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RatingServiceController],
      providers: [RatingServiceService],
    }).compile();

    ratingServiceController = app.get<RatingServiceController>(RatingServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ratingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
