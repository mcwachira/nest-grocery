import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { OnEvent } from '@nestjs/event-emitter';

interface OrderPaidEvent {
  orderId: string;
  userId: string;
}

@Injectable()
export class OrderPaidNotificationListener {
  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent('order.paid')
  async handle(event: OrderPaidEvent) {
    await this.notifications.create({
      userId: event.userId,
      type: 'ORDER_PAID',
      title: 'Order confirmed',
      body: `Your order has been paid and is being prepared.`,
      metadata: { orderId: event.orderId },
    });
  }
}
