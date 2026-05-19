import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function SignupPage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Card className="p-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold">Create your account</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Get started with one free test and unlock analytics tailored to your learning goals.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <Button>Sign up with email</Button>
            <Button variant="secondary">Continue with Google</Button>
          </div>
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{' '}
            <Link className="font-semibold text-brand-600 dark:text-brand-300" to="/login">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
