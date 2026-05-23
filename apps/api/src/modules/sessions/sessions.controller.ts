import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { StudentGuard } from '../../common/guards/student.guard';
import { SessionOwnerGuard } from '../../common/guards/session-owner.guard';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SessionsService } from './sessions.service';
import { CreateSessionSchema, type CreateSessionDto } from './dto/create-session.dto';
import { SaveAnswersSchema, type SaveAnswersDto } from './dto/save-answer.dto';

@Controller('sessions')
@UseGuards(StudentGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // IMPORTANT: static route 'active' must be declared BEFORE the dynamic ':id'
  // route so Express resolves it correctly.
  @Get('active')
  getActive(@CurrentUser() user: AuthUser) {
    return this.sessionsService.getActiveSession(user.id);
  }

  @Get(':id')
  @UseGuards(SessionOwnerGuard)
  getSession(@Param('id') id: string) {
    return this.sessionsService.getSession(id);
  }

  @Post()
  createSession(
    @Body(new ZodValidationPipe(CreateSessionSchema)) dto: CreateSessionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sessionsService.createSession(user.id, dto.configId);
  }

  @Put(':id/answers')
  @UseGuards(SessionOwnerGuard)
  saveAnswers(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SaveAnswersSchema)) dto: SaveAnswersDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sessionsService.saveAnswers(id, user.id, dto.answers, dto.markedForReview);
  }
}
