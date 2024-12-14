import { Message_type } from '@prisma/client';

export class GroupMessageDto {
  sender_id: string;
  group_id: string;
  message: string;
  type: Message_type;
}
