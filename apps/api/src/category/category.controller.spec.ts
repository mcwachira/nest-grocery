import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';


describe('CategoryController', () => {
  let controller: CategoryController;
  let categoriesService: {
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    categoriesService = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: categoriesService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('finds All requires no argument and delegates directly', async() => {
    categoriesService.findAll.mockResolvedValueOnce([]);
    await controller.findAll();
    expect(categoriesService.findAll).toHaveBeenCalled();
  });
});
