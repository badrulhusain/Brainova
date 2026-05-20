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
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
@UseGuards(AuthGuard)
export class TestConfigsController {
  constructor(private readonly testConfigsService: TestConfigsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    // Students see only active configs; admins see all
    return this.testConfigsService.findAll(user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.testConfigsService.findById(id, user.role);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body(new ZodValidationPipe(CreateTestConfigSchema)) dto: CreateTestConfigDto,
    @CurrentUser() user: User,
  ) {
    return this.testConfigsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTestConfigSchema)) dto: UpdateTestConfigDto,
    @CurrentUser() user: User,
  ) {
    return this.testConfigsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.testConfigsService.remove(id);
  }
}
