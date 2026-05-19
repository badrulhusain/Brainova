import { reload } from 'firebase/auth';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../features/auth/AuthProvider';
import { resendVerificationEmail } from '../features/auth/authService';
import { appCopy } from '../lib/constants/copy';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onResend = async () => {
    if (!user) {
      toast.error('Sign in before requesting verification.');
      return;
    }

    setIsSending(true);
    try {
      await resendVerificationEmail(user);
      toast.success('Verification email sent.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send verification email.');
    } finally {
      setIsSending(false);
    }
  };

  const onRefresh = async () => {
    if (!user) {
      toast.error('Sign in before refreshing verification.');
      return;
    }

    setIsRefreshing(true);
    try {
      await reload(user);
      toast.success(user.emailVerified ? 'Email verified.' : 'Email is still pending verification.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to refresh verification status.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <Card className="p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            <MailCheck aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold">{appCopy.auth.verifyTitle}</h1>
          <p className="mt-3 text-muted">{appCopy.auth.verifyDescription}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button disabled={isSending} onClick={onResend} type="button">
              {isSending ? 'Sending' : appCopy.auth.resendVerification}
            </Button>
            <Button disabled={isRefreshing} onClick={onRefresh} type="button" variant="secondary">
              {isRefreshing ? 'Refreshing' : 'Refresh status'}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
