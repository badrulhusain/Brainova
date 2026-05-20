import { Module } from '@nestjs/common';
import { TestConfigsController } from './test-configs.controller';
import { TestConfigsService } from './test-configs.service';

@Module({
  controllers: [TestConfigsController],
  providers: [TestConfigsService],
  exports: [TestConfigsService],
})
export class TestConfigsModule {}
