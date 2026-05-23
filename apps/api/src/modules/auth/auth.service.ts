import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { existsSync, readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import type { Secret, SignOptions } from 'jsonwebtoken';
import {
  AdminModelName,
  serialize,
  StudentModelName,
  type Admin,
  type MongoModel,
  type Student,
} from '../../database/mongo.schemas';
import type { AdminLoginDto } from './dto/admin-login.dto';
import type { StudentLoginDto } from './dto/student-login.dto';

export interface StudentJwtPayload {
  sub: string;
  studentId: string;
  admissionNo: string;
  role: 'STUDENT';
}

export interface AdminJwtPayload {
  sub: string;
  adminId: string;
  role: 'ADMIN';
}

export type JwtPayload = StudentJwtPayload | AdminJwtPayload;

type PublicStudent = Pick<Student, 'id' | 'name' | 'admissionNo' | 'department' | 'batch'>;
type PublicAdmin = Pick<Admin, 'id' | 'username'>;
type AttendanceStudentRow = {
  ADNO?: string | number;
  CLASS?: string | number;
  'FULL NAME'?: string;
  'SHORT NAME'?: string;
  active?: boolean;
};

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(StudentModelName)
    private readonly studentModel: MongoModel<Student>,
    @InjectModel(AdminModelName)
    private readonly adminModel: MongoModel<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAttendanceStudents();

    const count = await this.adminModel.countDocuments();
    if (count > 0) return;

    const username = this.configService.get<string>('ADMIN_USERNAME', 'admin');
    const password = this.configService.get<string>('ADMIN_PASSWORD', 'Admin@1234');
    const hashed = await bcrypt.hash(password, 12);
    await this.adminModel.create({ username, password: hashed });
    this.logger.log(`Default admin created — username: "${username}"`);
  }

  async loginStudent(dto: StudentLoginDto): Promise<{ token: string; student: PublicStudent }> {
    const admissionNo = dto.admissionNo.trim();
    const studentDoc = await this.studentModel.findOne({
      admissionNo: admissionNo.toUpperCase(),
    });
    const student = studentDoc ? serialize<Student>(studentDoc) : null;

    if (!student) {
      throw new UnauthorizedException('Admission number not found');
    }

    if (!student.active) {
      throw new UnauthorizedException(
        'Your account is inactive. Contact the administrator.',
      );
    }

    const payload: StudentJwtPayload = {
      sub: student.id,
      studentId: student.id,
      admissionNo: student.admissionNo,
      role: 'STUDENT',
    };

    const token = this.signToken(payload);
    return {
      token,
      student: {
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        department: student.department,
        batch: student.batch,
      },
    };
  }

  async loginAdmin(dto: AdminLoginDto): Promise<{ token: string; admin: PublicAdmin }> {
    const adminDoc = await this.adminModel.findOne({ username: dto.username.trim() });
    const admin = adminDoc ? serialize<Admin>(adminDoc) : null;

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: AdminJwtPayload = {
      sub: admin.id,
      adminId: admin.id,
      role: 'ADMIN',
    };

    const token = this.signToken(payload);
    return { token, admin: { id: admin.id, username: admin.username } };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_SECRET'),
      ) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  static verifyToken(token: string): JwtPayload & { sub: string } {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedException('JWT secret is not configured');

    try {
      const payload = jwt.verify(token, secret) as JwtPayload & { sub?: string };
      const sub =
        payload.sub ??
        (payload.role === 'STUDENT' ? payload.studentId : payload.adminId);
      return { ...payload, sub };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private signToken(payload: JwtPayload): string {
    const secret: Secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const options: SignOptions = {
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN') as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, secret, options);
  }

  private async seedAttendanceStudents(): Promise<void> {
    const filePath = this.findAttendanceStudentsFile();
    if (!filePath) {
      this.logger.warn('attendance.students.json not found; skipping student import');
      return;
    }

    let rows: AttendanceStudentRow[];
    try {
      const raw = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      rows = Array.isArray(parsed) ? (parsed as AttendanceStudentRow[]) : [];
    } catch (error) {
      this.logger.warn(
        `Unable to read attendance.students.json: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      return;
    }

    const students = new Map<
      string,
      { admissionNo: string; name: string; batch: string | null; active: boolean }
    >();

    for (const row of rows) {
      const admissionNo = String(row.ADNO ?? '').trim().toUpperCase();
      if (!admissionNo) continue;

      const name =
        row['FULL NAME']?.trim() ||
        row['SHORT NAME']?.trim() ||
        `Student ${admissionNo}`;
      const batch = row.CLASS === undefined ? null : String(row.CLASS).trim() || null;

      students.set(admissionNo, {
        admissionNo,
        name,
        batch,
        active: row.active !== false,
      });
    }

    if (students.size === 0) {
      this.logger.warn('attendance.students.json has no usable student rows');
      return;
    }

    for (const student of students.values()) {
      await this.studentModel.updateOne(
        { admissionNo: student.admissionNo },
        {
          $set: {
            name: student.name,
            batch: student.batch,
            active: student.active,
          },
          $setOnInsert: {
            admissionNo: student.admissionNo,
            department: null,
          },
        },
        { upsert: true },
      );
    }

    this.logger.log(`Imported ${students.size} students from attendance.students.json`);
  }

  private findAttendanceStudentsFile(): string | null {
    const candidates = [
      join(process.cwd(), 'attendance.students.json'),
      join(process.cwd(), 'apps/api/attendance.students.json'),
      join(__dirname, '../../../attendance.students.json'),
      join(__dirname, '../../../../attendance.students.json'),
    ];

    return candidates.find((candidate) => existsSync(candidate)) ?? null;
  }
}
