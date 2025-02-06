import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}
  private readonly logger = new Logger(ConversationsController.name);

  @Post()
  @ApiOperation({
    summary:
      "Crée une conversation pour le socket GroupMessage d'un utilisateur",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary:
      'Crée une ressource Conversation sur laquelle le socket GroupMessage pourra se connecter grâce à son id',
  })
  create(
    @Req() request: Request,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    this.logger.log('Request Body:', JSON.stringify(request.body));
    this.logger.log('Parsed DTO:', JSON.stringify(createConversationDto));
    const auth_id = request['user'].id;
    return this.conversationsService.create(auth_id, createConversationDto);
  }

  @Get()
  findAll() {
    return this.conversationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(+id);
  }
}
