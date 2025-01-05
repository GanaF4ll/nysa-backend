import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  private readonly logger = new Logger(ConversationController.name);

  @UseGuards(AuthGuard)
  @Post()
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
    return this.conversationService.create(auth_id, createConversationDto);
  }

  @Get()
  findAll() {
    return this.conversationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }
}
