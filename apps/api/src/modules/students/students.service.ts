import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  serialize,
  serializeMany,
  StudentModelName,
  type MongoModel,
  type Student,
} from '../../database/mongo.schemas';
import type { CreateStudentDto } from './dto/create-student.dto';
import type { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(StudentModelName)
    private readonly studentModel: MongoModel<Student>,
  ) {}

  async findAll(filters: {
    department?: string;
    batch?: string;
    active?: boolean;
  }): Promise<Student[]> {
    const rows = await this.studentModel
      .find({
        ...(filters.department && { department: filters.department }),
        ...(filters.batch && { batch: filters.batch }),
        ...(filters.active !== undefined && { active: filters.active }),
      })
      .sort({ createdAt: -1 });
    return serializeMany<Student>(rows);
  }

  async findById(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id);
    if (!student) throw new NotFoundException('Student not found');
    return serialize<Student>(student);
  }

  async create(dto: CreateStudentDto): Promise<Student> {
    const admissionNo = dto.admissionNo.trim().toUpperCase();
    const existing = await this.studentModel.exists({ admissionNo });
    if (existing) {
      throw new ConflictException(`Admission number ${admissionNo} already exists`);
    }

    const student = await this.studentModel.create({ ...dto, admissionNo });
    return serialize<Student>(student);
  }

  async bulkCreate(rows: CreateStudentDto[]): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        await this.create(row);
        created++;
      } catch {
        skipped++;
      }
    }

    return { created, skipped };
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentModel.findByIdAndUpdate(id, dto, { new: true });
    if (!student) throw new NotFoundException('Student not found');
    return serialize<Student>(student);
  }

  async deactivate(id: string): Promise<Student> {
    const student = await this.studentModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    );
    if (!student) throw new NotFoundException('Student not found');
    return serialize<Student>(student);
  }
}
