import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { registerStudent } from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthProvider';
import { studentRegisterSchema, type StudentRegisterValues } from '../lib/validators/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<StudentRegisterValues>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { name: '', admissionNo: '', batch: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await registerStudent(
        values.name,
        values.admissionNo,
        values.batch || undefined,
      );
      login(user);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed.');
    }
  });

  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Card className="p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted">
            Register with your admission number to start taking tests.
          </p>

          <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">
                Full name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="e.g. Rahul Kumar"
                aria-invalid={form.formState.errors.name ? 'true' : 'false'}
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Admission number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="admissionNo">
                Admission number <span className="text-red-500">*</span>
              </label>
              <Input
                id="admissionNo"
                autoComplete="off"
                placeholder="e.g. CS2024001"
                aria-invalid={form.formState.errors.admissionNo ? 'true' : 'false'}
                {...form.register('admissionNo')}
              />
              {form.formState.errors.admissionNo && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {form.formState.errors.admissionNo.message}
                </p>
              )}
            </div>

            {/* Batch (optional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="batch">
                Batch / Year <span className="text-xs text-muted">(optional)</span>
              </label>
              <Input
                id="batch"
                placeholder="e.g. 2024"
                {...form.register('batch')}
              />
            </div>

            <Button
              className="mt-2"
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 border-t border-border pt-5 text-sm text-muted">
            Already registered?{' '}
            <Link className="text-brand-600 hover:text-brand-700" to="/login">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
