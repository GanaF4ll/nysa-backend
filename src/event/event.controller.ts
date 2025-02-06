import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiOperation } from '@nestjs/swagger';
import { ImageService } from './image/image.service';
import { EventFilterDto } from './dto/event-filter.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateImageDto } from './image/dto/create-image.dto';
import { InvitationService } from '../invitation/invitation.service';

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private imageService: ImageService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Crée une ressource Event, nécessite d'être connecté",
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Crée une ressource Event',
  })
  async create(
    @Req() request: Request,
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const creator_id = request['user'].id;

    // Vérifie si des fichiers ont été uploadés
    const event_images = files
      ? files.map((file, index) => ({
          name: Date.now() + file.originalname,
          order: index,
          file: file.buffer,
        }))
      : [];

    return this.eventService.create(creator_id, createEventDto, event_images);
  }

  @Get()
  @ApiOperation({
    summary: "Retourne toutes les ressources Event, nécessite d'être connecté",
  })
  async findAll(@Query() filters: EventFilterDto) {
    return this.eventService.findAll(filters);
  }

  @Get('/my-memberships')
  @ApiOperation({
    summary:
      "Retourne toutes les ressources Event auxquelles l'utilisateur est inscrit",
  })
  async getMemberships(
    @Req() request: Request,
    @Query() filters: EventFilterDto,
  ) {
    const user_id = request['user'].id;
    return this.eventService.getMyMemberships(user_id, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retourne une ressource Event',
  })
  findOne(@Param('id') id: string, @Req() request: Request) {
    const user_id = request['user'].id;

    return this.eventService.findOne(id, user_id);
  }

  @Get('creator/:creator_id')
  @ApiOperation({
    summary: 'Retourne toutes les ressources Event créées par un utilisateur',
  })
  findByCreator(
    @Param('creator_id') creator_id: string,
    @Query() filters: EventFilterDto,
  ) {
    return this.eventService.findByCreator(creator_id, filters);
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

  @Post(':event_id/images')
  @UseInterceptors(FileInterceptor('file'))
  async createImage(
    @Param('event_id') event_id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    const completeDto = {
      ...createImageDto,
      file: file.buffer,
      name: file.originalname,
    };
    const folder = 'events';
    return this.imageService.createEventImage(event_id, completeDto);
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
