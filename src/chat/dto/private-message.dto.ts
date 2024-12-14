import { Message_type } from '@prisma/client';

export class PrivateMessageDto {
  sender_id: string;
  recipient_id: string;
  message: string;
  type: Message_type;
}
