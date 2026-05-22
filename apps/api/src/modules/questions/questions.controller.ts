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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AnyUserGuard } from '../../common/guards/any-user.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { QuestionsService } from './questions.service';
import { CreateQuestionSchema, type CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionSchema, type UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionFilterSchema, type QuestionFilterDto } from './dto/question-filter.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @UseGuards(AnyUserGuard)
  findAll(
    @Query(new ZodValidationPipe(QuestionFilterSchema)) filter: QuestionFilterDto,
  ) {
    return this.questionsService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(AnyUserGuard)
  findOne(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Get(':id/answer-key')
  @UseGuards(AdminGuard)
  getAnswerKey(@Param('id') id: string) {
    return this.questionsService.getAnswerKey(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body(new ZodValidationPipe(CreateQuestionSchema)) dto: CreateQuestionDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.questionsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateQuestionSchema)) dto: UpdateQuestionDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.questionsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.questionsService.remove(id);
  }
}
