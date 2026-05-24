import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { StudentGuard } from '../../common/guards/student.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AptitudeService } from './aptitude.service';
import { SubmitAptitudeSchema, type SubmitAptitudeDto } from './dto/submit-aptitude.dto';

const AdminScoreSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

@Controller('aptitude')
export class AptitudeController {
  constructor(private readonly aptitudeService: AptitudeService) {}

  @Get('questions')
  @UseGuards(StudentGuard)
  getQuestions() {
    return this.aptitudeService.getQuestions();
  }

  @Post('submit')
  @UseGuards(StudentGuard)
  submit(
    @Body(new ZodValidationPipe(SubmitAptitudeSchema)) dto: SubmitAptitudeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aptitudeService.submit(user.id, dto);
  }

  @Get('result/latest')
  @UseGuards(StudentGuard)
  getLatestResult(@CurrentUser() user: AuthUser) {
    return this.aptitudeService.getLatestResult(user.id);
  }

  @Get('result/:id')
  @UseGuards(StudentGuard)
  getResultById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.aptitudeService.getResultById(id, user.id);
  }

  @Get('admin/questions')
  @UseGuards(AdminGuard)
  adminGetQuestions() {
    return this.aptitudeService.getQuestions();
  }

  @Get('admin/all-questions')
  @UseGuards(AdminGuard)
  adminGetAllQuestions() {
    return this.aptitudeService.getAllQuestionsAdmin();
  }

  @Post('admin/score')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  adminScore(
    @Body(new ZodValidationPipe(AdminScoreSchema)) dto: { answers: Record<string, string> },
  ) {
    return this.aptitudeService.previewScore(dto.answers);
  }
}
