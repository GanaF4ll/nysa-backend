import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
  });

  constructor(private readonly configService: ConfigService) {}

  /**
   * @description send/update un fichier dans le bucket S3
   * @param filename
   * @param file
   */
  async upload(filename: string, file: Buffer) {
    try {
      console.log('filename', filename);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'nysa-app',
          Key: filename,
          Body: file,
        }),
      );

      const response = { message: filename };
      return response;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw new BadRequestException(error);
    }
  }

  /**
   * @description Génère une URL signée pour un fichier dans le bucket S3
   * @param filename
   * @param expiresIn : valeur à laquelle l'URL signée expire (604800 valeur max)
   * @returns
   */
  async getSignedUrl(filename: string, expiresIn = 7200): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: 'nysa-app',
        Key: filename,
      });

      // Générer une URL signée qui expire après expiresIn secondes (par défaut 1 heure)
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
