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
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ImageService } from './image/image.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private imageService: ImageService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Crée une ressource Event',
  })
  create(@Req() request: Request, @Body() createEventDto: CreateEventDto) {
    const creator_id = request['user'].id;
    return this.eventService.create(creator_id, createEventDto);
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

  /*****************************
   *******IMAGES ROUTES*********
   *****************************/

  @Get(':id/images')
  @ApiOperation({
    summary: "Récupère toutes les images d'un événement",
  })
  getImagesByEventId(@Param('id') event_id: string) {
    return this.imageService.getImagesByEventId(event_id);
  }

  @Post(':id/images')
  @ApiOperation({
    summary: 'Crée une image pour un événement',
  })
  createImage(@Param('id') event_id: string, @Body() createImageDto) {
    return this.imageService.create(event_id, createImageDto);
  }

  @Patch('images/:image_id')
  @ApiOperation({
    summary: 'Met à jour une image',
  })
  updateImage(@Param('image_id') image_id: string, @Body() updateImageDto) {
    return this.imageService.update(image_id, updateImageDto);
  }

  @Delete('images/:image_id')
  @ApiOperation({
    summary: 'Supprime une image',
  })
  deleteImage(@Param('image_id') image_id: string) {
    return this.imageService.delete(image_id);
  }
}
