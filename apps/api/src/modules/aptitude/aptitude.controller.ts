import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { StudentGuard } from '../../common/guards/student.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AptitudeService } from './aptitude.service';
import { SubmitAptitudeSchema, type SubmitAptitudeDto } from './dto/submit-aptitude.dto';

@Controller('aptitude')
@UseGuards(StudentGuard)
export class AptitudeController {
  constructor(private readonly aptitudeService: AptitudeService) {}

  @Get('questions')
  getQuestions() {
    return this.aptitudeService.getQuestions();
  }

  @Post('submit')
  submit(
    @Body(new ZodValidationPipe(SubmitAptitudeSchema)) dto: SubmitAptitudeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aptitudeService.submit(user.id, dto);
  }

  @Get('result/latest')
  getLatestResult(@CurrentUser() user: AuthUser) {
    return this.aptitudeService.getLatestResult(user.id);
  }

  @Get('result/:id')
  getResultById(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.aptitudeService.getResultById(id, user.id);
  }
}
