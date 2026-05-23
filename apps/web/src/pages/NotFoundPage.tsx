import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { appCopy } from '../lib/constants/copy';

export default function NotFoundPage() {
  return (
    <main className="bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
        <Card className="w-full p-12 text-center">
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">{appCopy.notFound.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold">{appCopy.notFound.title}</h1>
          <p className="mt-2 text-muted">{appCopy.notFound.body}</p>
          <Link to="/">
            <Button className="mt-6">{appCopy.notFound.action}</Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
