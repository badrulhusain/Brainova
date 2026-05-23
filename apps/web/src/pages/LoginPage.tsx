import { useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { loginAsStudent, loginAsAdmin } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthProvider';
import {
  studentLoginSchema,
  adminLoginSchema,
  type StudentLoginValues,
  type AdminLoginValues,
} from '../lib/validators/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [mode, setMode] = useState<'student' | 'admin'>('student');

  const routeState = location.state as { from?: { pathname?: string } } | null;
  const redirectTo = routeState?.from?.pathname ?? '/dashboard';

  const studentForm = useForm<StudentLoginValues>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: { name: '', admissionNo: '' },
  });

  const adminForm = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onStudentLogin = studentForm.handleSubmit(async (values) => {
    try {
      const user = await loginAsStudent(values.name, values.admissionNo);
      login(user);
      toast.success(`Welcome, ${user.name}`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  });

  const onAdminLogin = adminForm.handleSubmit(async (values) => {
    try {
      const user = await loginAsAdmin(values.username, values.password);
      login(user);
      toast.success('Signed in as admin.');
      navigate('/admin', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials.');
    }
  });

  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Card className="p-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold">
              {mode === 'student' ? 'Enter your details' : 'Admin sign in'}
            </h1>
            <p className="text-muted">
              {mode === 'student'
                ? 'Enter your name and admission number to start your test.'
                : 'Use your admin credentials to manage the platform.'}
            </p>
          </div>

          {mode === 'student' ? (
            <form className="mt-8 flex flex-col gap-4" onSubmit={onStudentLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="student-name">
                  Full name
                </label>
                <Input
                  id="student-name"
                  autoComplete="name"
                  placeholder="e.g. Rahul Kumar"
                  aria-invalid={studentForm.formState.errors.name ? 'true' : 'false'}
                  {...studentForm.register('name')}
                />
                {studentForm.formState.errors.name ? (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {studentForm.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="student-admissionNo">
                  Admission number
                </label>
                <Input
                  id="student-admissionNo"
                  autoComplete="off"
                  placeholder="e.g. CS2024001"
                  aria-invalid={studentForm.formState.errors.admissionNo ? 'true' : 'false'}
                  {...studentForm.register('admissionNo')}
                />
                {studentForm.formState.errors.admissionNo ? (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {studentForm.formState.errors.admissionNo.message}
                  </p>
                ) : null}
              </div>

              <Button disabled={studentForm.formState.isSubmitting} type="submit">
                {studentForm.formState.isSubmitting ? 'Signing in…' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form className="mt-8 flex flex-col gap-4" onSubmit={onAdminLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="admin-username">
                  Username
                </label>
                <Input
                  id="admin-username"
                  autoComplete="username"
                  aria-invalid={adminForm.formState.errors.username ? 'true' : 'false'}
                  {...adminForm.register('username')}
                />
                {adminForm.formState.errors.username ? (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {adminForm.formState.errors.username.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="admin-password">
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={adminForm.formState.errors.password ? 'true' : 'false'}
                  {...adminForm.register('password')}
                />
                {adminForm.formState.errors.password ? (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {adminForm.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button disabled={adminForm.formState.isSubmitting} type="submit">
                {adminForm.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <button
              className="text-sm text-muted hover:text-foreground transition-colors"
              onClick={() => setMode(mode === 'student' ? 'admin' : 'student')}
              type="button"
            >
              {mode === 'student' ? 'Admin sign in →' : '← Back to student login'}
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
