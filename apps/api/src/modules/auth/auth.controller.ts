import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { adminLoginSchema, type AdminLoginDto } from './dto/admin-login.dto';
import { studentLoginSchema, type StudentLoginDto } from './dto/student-login.dto';
import { studentRegisterSchema, type StudentRegisterDto } from './dto/student-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('student/register')
  studentRegister(
    @Body(new ZodValidationPipe(studentRegisterSchema)) dto: StudentRegisterDto,
  ) {
    return this.authService.registerStudent(dto);
  }

  @Post('student/login')
  @HttpCode(HttpStatus.OK)
  studentLogin(
    @Body(new ZodValidationPipe(studentLoginSchema)) dto: StudentLoginDto,
  ) {
    return this.authService.loginStudent(dto);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  adminLogin(
    @Body(new ZodValidationPipe(adminLoginSchema)) dto: AdminLoginDto,
  ) {
    return this.authService.loginAdmin(dto);
  }
}
