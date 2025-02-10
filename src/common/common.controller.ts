import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
      },
      fileFilter(req, file, callback) {
        if (file.mimetype !== 'video/mp4')
          return callback(
            new BadRequestException('MP4 타입만 업로드가 가능합니다!'),
            false,
          );

        return callback(null, true);
      },
    }),
  )
  createVideo(
    @UploadedFile()
    video: Express.Multer.File,
  ) {
    return { fileName: video.filename };
  }
}
