import { Link, useLocation, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { continueAsGuest, loginWithEmail, loginWithGoogle, requestPasswordReset } from '../features/auth/authService';
import { appCopy } from '../lib/constants/copy';
import {
  loginSchema,
  resetPasswordSchema,
  type LoginFormValues,
  type ResetPasswordFormValues,
} from '../lib/validators/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const routeState = location.state as { from?: { pathname?: string } } | null;
  const redirectTo = routeState?.from?.pathname ?? '/dashboard';

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onEmailLogin = loginForm.handleSubmit(async (values) => {
    try {
      await loginWithEmail(values);
      toast.success('Signed in successfully.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  });

  const onPasswordReset = resetForm.handleSubmit(async (values) => {
    try {
      await requestPasswordReset(values);
      toast.success('Password reset email sent.');
      setShowReset(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send reset email.');
    }
  });

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      await continueAsGuest();
      toast.success('Guest session started.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start guest session.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Card className="p-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold">{appCopy.auth.loginTitle}</h1>
            <p className="text-muted">{appCopy.auth.loginSubtitle}</p>
          </div>

          <form className="mt-8 flex flex-col gap-4" onSubmit={onEmailLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="login-email">
                Email
              </label>
              <Input
                id="login-email"
                autoComplete="email"
                type="email"
                aria-invalid={loginForm.formState.errors.email ? 'true' : 'false'}
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email ? (
                <p className="text-sm text-red-700 dark:text-red-300">{loginForm.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                Password
              </label>
              <Input
                id="login-password"
                autoComplete="current-password"
                type="password"
                aria-invalid={loginForm.formState.errors.password ? 'true' : 'false'}
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password ? (
                <p className="text-sm text-red-700 dark:text-red-300">{loginForm.formState.errors.password.message}</p>
              ) : null}
            </div>

            <Button disabled={loginForm.formState.isSubmitting} type="submit">
              {loginForm.formState.isSubmitting ? 'Signing in' : appCopy.auth.emailAction}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            <Button disabled={isGoogleLoading} onClick={onGoogleLogin} type="button" variant="secondary">
              {isGoogleLoading ? 'Opening Google' : appCopy.auth.googleAction}
            </Button>
            <Button disabled={isGuestLoading} onClick={onGuestLogin} type="button" variant="ghost">
              {isGuestLoading ? 'Starting guest session' : appCopy.auth.guestAction}
            </Button>
          </div>

          <div className="mt-6">
            <button
              className="rounded-lg text-sm font-semibold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              onClick={() => setShowReset((value) => !value)}
              type="button"
            >
              {appCopy.auth.resetTitle}
            </button>
          </div>

          {showReset ? (
            <form className="mt-5 rounded-lg border border-border bg-surfaceSoft p-4" onSubmit={onPasswordReset}>
              <p className="text-sm text-muted">{appCopy.auth.resetDescription}</p>
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="reset-email">
                  Email
                </label>
                <Input
                  id="reset-email"
                  autoComplete="email"
                  type="email"
                  aria-invalid={resetForm.formState.errors.email ? 'true' : 'false'}
                  {...resetForm.register('email')}
                />
                {resetForm.formState.errors.email ? (
                  <p className="text-sm text-red-700 dark:text-red-300">{resetForm.formState.errors.email.message}</p>
                ) : null}
              </div>
              <Button className="mt-4" disabled={resetForm.formState.isSubmitting} type="submit">
                {resetForm.formState.isSubmitting ? 'Sending' : appCopy.auth.resetAction}
              </Button>
            </form>
          ) : null}

          <p className="mt-6 text-sm text-muted">
            {appCopy.auth.signupPrompt}{' '}
            <Link
              className="rounded-lg font-semibold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              to="/signup"
            >
              {appCopy.nav.signup}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
