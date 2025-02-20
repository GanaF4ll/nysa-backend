import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { AwsService } from 'src/aws/aws.service';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly awsService: AwsService,
  ) {}

  async getImagesByEventId(event_id: string) {
    const existingEvent = await this.prismaService.events.findUnique({
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
      return [];
    }
    const folder = 'events';
    const response = await Promise.all(
      images.map(async (image) => {
        const url = await this.awsService.getSignedUrl(folder, image.url);
        return { url, order: image.order };
      }),
    );

    return response;
  }

  async getFirstImageByEventId(event_id: string) {
    const existingEvent = await this.prismaService.events.findUnique({
      where: { id: event_id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with id ${event_id} not found`);
    }

    const image = await this.prismaService.event_images.findFirst({
      where: { event_id, order: 1 },
    });

    if (!image) {
      return null;
    }

    const folder = 'events';
    const response = await this.awsService.getSignedUrl(folder, image.url);

    return response;
  }

  async getProfilePic(user_id: string) {
    const profilePic = await this.prismaService.users.findUnique({
      where: { id: user_id },
      select: { image_url: true },
    });

    if (!profilePic) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }
    const folder = 'users';
    const response = await this.awsService.getSignedUrl(folder, profilePic.image_url);

    return response;
  }

  async createEventImage(event_id: string, createImageDto: CreateImageDto) {
    const { name, order, file } = createImageDto;
    const folder = 'events';
    try {
      const fileS3 = await this.awsService.upload(folder, name, file);

      if (!fileS3) {
        throw new BadRequestException('Error uploading image');
      }

      const existingEvent = await this.prismaService.events.findUnique({
        where: { id: event_id },
      });
      if (!existingEvent) {
        throw new NotFoundException(`Event with id ${event_id} not found`);
      }

      const s3Name = fileS3.message;

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

  async createUserImage(createImageDto: CreateImageDto) {
    const { name, file } = createImageDto;
    const folder = 'users';
    try {
      const fileS3 = await this.awsService.upload(folder, name, file);

      if (!fileS3) {
        throw new BadRequestException('Error uploading image');
      }

      const s3Name = fileS3.message;

      return {
        data: s3Name,
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
