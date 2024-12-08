import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({
    summary: 'Crée une ressource Event',
  })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retourne toutes les ressources Event',
  })
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retourne une ressource Event',
  })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Get('creator/:creator_id')
  @ApiOperation({
    summary: 'Retourne toutes les ressources Event créées par un utilisateur',
  })
  findByCreator(@Param('creator_id') creator_id: string) {
    return this.eventService.findByCreator(creator_id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Met à jour une ressource Event, nécessite d'être connecté",
  })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Supprime une ressource Event, nécessite d'être connecté",
  })
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}
