import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { EventService } from '../event.service';

@Injectable()
export class ImageService {
  constructor(
    private prismaService: PrismaService,
    private eventService: EventService,
  ) {}

  async getImagesByEventId(event_id: string) {
    const existingEvent = await this.eventService.findOne(event_id);

    if (!existingEvent) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    const images = await this.prismaService.event_images.findMany({
      where: { event_id: event_id },
      orderBy: { order: 'asc' },
    });

    if (!images || images.length === 0) {
      throw new NotFoundException(
        `No images found for the event with id ${event_id}`,
      );
    }

    return images;
  }

  async create(event_id: string, createImageDto: CreateImageDto) {
    const existingEvent = await this.eventService.findOne(event_id);

    if (!existingEvent) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    const newImage = await this.prismaService.event_images.create({
      data: {
        event_id,
        ...createImageDto,
      },
    });

    return newImage;
  }

  async update(image_id: string, updateImageDto: CreateImageDto) {
    const existingImage = await this.prismaService.event_images.findUnique({
      where: { id: image_id },
    });

    if (!existingImage) {
      throw new NotFoundException('Image not found');
    }

    const updatedImage = await this.prismaService.event_images.update({
      where: { id: image_id },
      data: updateImageDto,
    });

    return updatedImage;
  }

  async delete(image_id: string) {
    const existingImage = await this.prismaService.event_images.findUnique({
      where: { id: image_id },
    });

    if (!existingImage) {
      throw new NotFoundException('Image not found');
    }

    await this.prismaService.event_images.delete({ where: { id: image_id } });

    return `image '${image_id}' deleted`;
  }
}
