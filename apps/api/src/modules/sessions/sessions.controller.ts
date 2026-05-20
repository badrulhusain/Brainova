import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SessionOwnerGuard } from '../../common/guards/session-owner.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SessionsService } from './sessions.service';
import { CreateSessionSchema, type CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
@UseGuards(AuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // IMPORTANT: static route 'active' must be declared BEFORE the dynamic ':id'
  // route so Express resolves it correctly.
  @Get('active')
  getActive(@CurrentUser() user: User) {
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
    @CurrentUser() user: User,
  ) {
    return this.sessionsService.createSession(user.id, dto.configId);
  }
}
