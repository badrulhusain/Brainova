import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TestConfigsService } from './test-configs.service';
import {
  CreateTestConfigSchema,
  type CreateTestConfigDto,
} from './dto/create-test-config.dto';
import {
  UpdateTestConfigSchema,
  type UpdateTestConfigDto,
} from './dto/update-test-config.dto';

@Controller('test-configs')
export class TestConfigsController {
  constructor(private readonly testConfigsService: TestConfigsService) {}

  @Get()
  findAll() {
    return this.testConfigsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testConfigsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body(new ZodValidationPipe(CreateTestConfigSchema)) dto: CreateTestConfigDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.testConfigsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTestConfigSchema)) dto: UpdateTestConfigDto,
  ) {
    return this.testConfigsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.testConfigsService.remove(id);
  }
}
