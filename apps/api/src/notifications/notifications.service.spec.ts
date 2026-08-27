import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

function createPrismaMock() {
  return {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('markRead — the IDOR-prevention test', () => {
    it('scopes the update to BOTH the notification id AND the requesting user', async () => {
      prisma.notification.updateMany.mockResolvedValueOnce({ count: 1 });

      await service.markRead('user-1', 'notif-1');

      // This is the entire security guarantee of this method, in one
      // assertion: userId must be part of the WHERE clause, not just id.
      // A regression to `update({ where: { id } })` (dropping the userId
      // filter) would still "work" for a user marking their own
      // notification read -- it would only fail closed for the attack
      // case, which THIS test is what catches.
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { readAt: expect.any(Date) },
      });
    });

    it('silently no-ops (does not throw) when the notification belongs to someone else', async () => {
      // updateMany matches zero rows for a mismatched userId -- Prisma
      // does not throw for zero matched rows, unlike update().
      prisma.notification.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(service.markRead('user-1', 'someone-elses-notif')).resolves.toBeUndefined();
    });
  });

  describe('findMine', () => {
    it('filters to readAt: null only when unreadOnly is explicitly true', async () => {
      prisma.notification.findMany.mockResolvedValueOnce([]);

      await service.findMine('user-1', true);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId: 'user-1', readAt: null } }),
      );
    });

    it('does not filter by readAt at all when unreadOnly is false (the default)', async () => {
      prisma.notification.findMany.mockResolvedValueOnce([]);

      await service.findMine('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });
});