import { Module } from '@nestjs/common';
import { ImageScanController } from './imageScan.controller';
import { ImageScanService } from './imageScan.service';

@Module({
  controllers: [ImageScanController],
  providers: [ImageScanService],
  exports: [ImageScanService],
})
export class ImageScanModule {}
