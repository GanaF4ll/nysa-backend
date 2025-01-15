import {
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png)$/,
          }),
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileName = new Date().getTime().toString() + `_` + file.originalname;

    await this.awsService.upload(fileName, file.buffer);
  }
}
