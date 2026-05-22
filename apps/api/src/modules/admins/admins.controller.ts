import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AdminsService } from './admins.service';
import { CreateAdminSchema, type CreateAdminDto } from './dto/create-admin.dto';
import type { Admin } from '../../database/mongo.schemas';

@Controller('admins')
@UseGuards(AdminGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateAdminSchema)) dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() admin: Admin) {
    return this.adminsService.remove(id, admin.id);
  }
}
