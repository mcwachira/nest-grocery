import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import {OrderPaidNotificationListener} from "../payments/order-paid.listener";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, OrderPaidNotificationListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
