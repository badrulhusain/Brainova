import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { continueAsGuest, loginWithGoogle, signupWithEmail } from '../features/auth/authService';
import { appCopy } from '../lib/constants/copy';
import { signupSchema, type SignupFormValues } from '../lib/validators/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onEmailSignup = signupForm.handleSubmit(async (values) => {
    try {
      await signupWithEmail(values);
      toast.success('Account created. Verification email sent.');
      navigate('/verify-email', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create account.');
    }
  });

  const onGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google.');
      navigate('/dashboard', { replace: true });
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
      navigate('/dashboard', { replace: true });
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
            <h1 className="text-3xl font-semibold">{appCopy.auth.signupTitle}</h1>
            <p className="text-muted">{appCopy.auth.signupSubtitle}</p>
          </div>

          <form className="mt-8 flex flex-col gap-4" onSubmit={onEmailSignup}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-name">
                Name
              </label>
              <Input
                id="signup-name"
                autoComplete="name"
                aria-invalid={signupForm.formState.errors.displayName ? 'true' : 'false'}
                {...signupForm.register('displayName')}
              />
              {signupForm.formState.errors.displayName ? (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {signupForm.formState.errors.displayName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-email">
                Email
              </label>
              <Input
                id="signup-email"
                autoComplete="email"
                type="email"
                aria-invalid={signupForm.formState.errors.email ? 'true' : 'false'}
                {...signupForm.register('email')}
              />
              {signupForm.formState.errors.email ? (
                <p className="text-sm text-red-700 dark:text-red-300">{signupForm.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-password">
                Password
              </label>
              <Input
                id="signup-password"
                autoComplete="new-password"
                type="password"
                aria-invalid={signupForm.formState.errors.password ? 'true' : 'false'}
                {...signupForm.register('password')}
              />
              {signupForm.formState.errors.password ? (
                <p className="text-sm text-red-700 dark:text-red-300">{signupForm.formState.errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="signup-confirm-password">
                Confirm password
              </label>
              <Input
                id="signup-confirm-password"
                autoComplete="new-password"
                type="password"
                aria-invalid={signupForm.formState.errors.confirmPassword ? 'true' : 'false'}
                {...signupForm.register('confirmPassword')}
              />
              {signupForm.formState.errors.confirmPassword ? (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {signupForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button disabled={signupForm.formState.isSubmitting} type="submit">
              {signupForm.formState.isSubmitting ? 'Creating account' : appCopy.auth.emailAction}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            <Button disabled={isGoogleLoading} onClick={onGoogleSignup} type="button" variant="secondary">
              {isGoogleLoading ? 'Opening Google' : appCopy.auth.googleAction}
            </Button>
            <Button disabled={isGuestLoading} onClick={onGuestLogin} type="button" variant="ghost">
              {isGuestLoading ? 'Starting guest session' : appCopy.auth.guestAction}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted">
            {appCopy.auth.loginPrompt}{' '}
            <Link
              className="rounded-lg font-semibold text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
              to="/login"
            >
              {appCopy.nav.login}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
