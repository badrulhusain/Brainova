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
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { QuestionsService } from './questions.service';
import { CreateQuestionSchema, type CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionSchema, type UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionFilterSchema, type QuestionFilterDto } from './dto/question-filter.dto';

@Controller('questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(QuestionFilterSchema)) filter: QuestionFilterDto,
  ) {
    return this.questionsService.findAll(filter);
  }

  @Get(':id')
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
    @CurrentUser() user: User,
  ) {
    return this.questionsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateQuestionSchema)) dto: UpdateQuestionDto,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.questionsService.remove(id);
  }
}
