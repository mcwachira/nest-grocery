import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { NotFoundException } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

function createPrismaMock() {
  return {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}
describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<CategoryService>(CategoryService);
  });

  it('findsAll returns a flat, sortOrder-sorted list of categories', async () => {
    prisma.category.findMany.mockResolvedValueOnce([
      { id: 'c1', sortOrder: 0 },
    ]);

    await service.findAll();

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('updates throw NotFoundException for a nonexistent id, without calling update', async () => {
    prisma.category.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.update('ghost-id', { name: 'New Name' }),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.category.update).not.toHaveBeenCalled();
  });

  it('updates passes the id and dto through unchanged on success', async () => {
    prisma.category.findUnique.mockResolvedValueOnce({ id: 'c1' });
    prisma.category.update.mockResolvedValueOnce({
      id: 'c1',
      name: 'New Name',
    });

    await service.update('c1', { name: 'New Name' });

    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { name: 'New Name' },
    });
  });
});
