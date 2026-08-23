import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

function createProductsServiceMock() {
  return {
    findMany: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
  };
}

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ReturnType<typeof createProductsServiceMock>;

  beforeEach(async () => {
    productsService = createProductsServiceMock();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();
    controller = module.get<ProductsController>(ProductsController);
  });

  it('findMany delegates the query object as-is', async () => {
    productsService.findMany.mockResolvedValueOnce({ items: [], total: 0 });
    const query = { category: 'produce', page: 2 };

    await controller.findMany(query as any);

    expect(productsService.findMany).toHaveBeenCalledWith(query);
  });

  it('findOne passes the slug param through to findBySlug, not findMany', async () => {
    productsService.findBySlug.mockResolvedValueOnce({ slug: 'kale' });

    await controller.findOne('kale');

    expect(productsService.findBySlug).toHaveBeenCalledWith('kale');
  });

  it('update passes both id and dto through in the right order', async () => {
    productsService.update.mockResolvedValueOnce({ id: 'p1' });
    const dto = { priceCents: 20000 };

    await controller.update('p1', dto as any);

    expect(productsService.update).toHaveBeenCalledWith('p1', dto);
  });
});
