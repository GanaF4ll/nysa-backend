import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { EventService } from '../event.service';
import { AwsService } from 'src/aws/aws.service';
import { UpdateImageDto } from './dto/update-image.dto';
import { log } from 'console';

@Injectable()
export class ImageService {
  constructor(
    private prismaService: PrismaService,
    private awsService: AwsService,
  ) {}

  async getImagesByEventId(event_id: string) {
    const existingEvent = await this.prismaService.event.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    const images = await this.prismaService.event_images.findMany({
      where: { event_id },
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
    const { name, order, file } = createImageDto;

    try {
      console.log('name', name);

      const fileS3 = await this.awsService.upload(name, file);

      if (!fileS3) {
        throw new BadRequestException('Error uploading image');
      }

      const existingEvent = await this.prismaService.event.findUnique({
        where: { id: event_id },
      });
      if (!existingEvent) {
        throw new NotFoundException(`Event with id ${event_id} not found`);
      }
      // console.log('fileS3', fileS3);

      const s3Name = fileS3.message;
      // console.log('s3Name', s3Name);

      const newImage = await this.prismaService.event_images.create({
        data: {
          event_id,
          url: s3Name,
          order,
        },
      });

      return {
        message: `Image ${newImage.url} created for the event ${event_id}`,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(image_id: string, updateImageDto: UpdateImageDto) {
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

  // TODO: ajouter la suppression de l'image dans le bucket S3
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
