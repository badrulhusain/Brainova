import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function NotFoundPage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
        <Card className="w-full p-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">404</p>
          <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            The route you were looking for is not available yet.
          </p>
          <Link to="/">
            <Button className="mt-6">Go home</Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
