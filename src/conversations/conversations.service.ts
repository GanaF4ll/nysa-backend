import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger('ConversationService');

  async create(id: string, createConversationDto: CreateConversationDto) {
    if (!createConversationDto) {
      throw new BadRequestException('Invalid data: conversation data is required');
    }

    this.logger.log('createConversationDto:', JSON.stringify(createConversationDto));

    if (!createConversationDto.name) {
      throw new BadRequestException('Invalid data: name is required');
    }

    if (!Array.isArray(createConversationDto.users)) {
      throw new BadRequestException('Invalid data: users array is required');
    }

    const { name, users } = createConversationDto;

    // ?? Si plus de 2 users, c'est un groupe
    let is_private = users.length <= 2;

    const existingAdmin = await this.prismaService.users.findUnique({
      where: { id: id },
    });

    if (!existingAdmin) {
      throw new NotFoundException('User not found');
    }

    const newConversation = await this.prismaService.conversations.create({
      data: { name, is_private },
    });

    for (const user_id of users) {
      const existingUser = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      await this.prismaService.conversation_members.create({
        data: {
          user_id,
          conversation_id: newConversation.id,
        },
      });
    }

    return 'Conversation created';
  }
  //  TODO: finir service conversation
  findAll() {
    return `This action returns all conversation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
