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
import { z } from 'zod';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { StudentsService } from './students.service';
import { CreateStudentSchema, type CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentSchema, type UpdateStudentDto } from './dto/update-student.dto';

const ListQuerySchema = z.object({
  department: z.string().optional(),
  batch: z.string().optional(),
  active: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v !== 'false')),
});

const BulkImportSchema = z.object({
  students: z.array(CreateStudentSchema).min(1),
});

@Controller('students')
@UseGuards(AdminGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(ListQuerySchema)) query: z.infer<typeof ListQuerySchema>) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(CreateStudentSchema)) dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  bulkCreate(
    @Body(new ZodValidationPipe(BulkImportSchema)) body: z.infer<typeof BulkImportSchema>,
  ) {
    return this.studentsService.bulkCreate(body.students);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStudentSchema)) dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.studentsService.deactivate(id);
  }
}
