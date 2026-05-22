import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AptitudeController } from './aptitude.controller';
import { AptitudeService } from './aptitude.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AptitudeController],
  providers: [AptitudeService],
  exports: [AptitudeService],
})
export class AptitudeModule {}
