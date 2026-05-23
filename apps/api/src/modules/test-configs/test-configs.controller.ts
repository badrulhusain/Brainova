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
import { z } from 'zod';
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

const PreviewScoreSchema = z.object({
  questionIds: z.array(z.string()),
  answers: z.record(z.string(), z.string()),
  marksPerQuestion: z.number().positive(),
  negativeMarksRatio: z.number().min(0),
});

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

  @Get(':id/preview')
  @UseGuards(AdminGuard)
  previewQuestions(@Param('id') id: string) {
    return this.testConfigsService.previewQuestions(id);
  }

  @Post(':id/preview/score')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  previewScore(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(PreviewScoreSchema))
    dto: { questionIds: string[]; answers: Record<string, string>; marksPerQuestion: number; negativeMarksRatio: number },
  ) {
    void id;
    return this.testConfigsService.previewScore(
      dto.questionIds,
      dto.answers,
      dto.marksPerQuestion,
      dto.negativeMarksRatio,
    );
  }
}
