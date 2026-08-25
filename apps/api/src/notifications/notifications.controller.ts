import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findMine(
    @Req() req: Request & { user: { userId: string } },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notifications.findMine(req.user.userId, unreadOnly === 'true');
  }

  @Get('unread-count')
  countUnread(@Req() req: Request & { user: { userId: string } }) {
    return this.notifications.countUnread(req.user.userId);
  }

  @Patch(':id/read')
  markRead(
    @Req() req: Request & { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(req.user.userId, id);
  }

  @Patch('read-all')
  markAllRead(@Req() req: Request & { user: { userId: string } }) {
    return this.notifications.markAllRead(req.user.userId);
  }
}
