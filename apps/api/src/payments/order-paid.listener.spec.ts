import { Test, TestingModule } from '@nestjs/testing';
import { OrderPaidNotificationListener } from './order-paid.listener';
import { NotificationsService } from '../notifications/notifications.service';

describe('OrderPaidNotificationListener', () => {
  let listener: OrderPaidNotificationListener;
  let notifications: { create: jest.Mock };

  beforeEach(async () => {
    notifications = { create: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderPaidNotificationListener,
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();
    listener = module.get<OrderPaidNotificationListener>(
      OrderPaidNotificationListener,
    );
  });

  it('creates an ORDER_PAID notification with the orderId in metadata', async () => {
    await listener.handle({ orderId: 'order-1', userId: 'user-1' });

    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        type: 'ORDER_PAID',
        metadata: { orderId: 'order-1' },
      }),
    );
  });
});
