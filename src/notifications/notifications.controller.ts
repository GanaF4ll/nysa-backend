import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  sendNotification(@Body() pushNotification: sendNotificationDTO) {
    this.notificationsService.sendPush(pushNotification);
  }
}
