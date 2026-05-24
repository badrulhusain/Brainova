import { Link } from 'react-router-dom';
import { BrainCircuit, ClipboardCheck, GraduationCap, Users } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function AdminPage() {
  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section>
          <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">Admin Console</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
            Manage students, view results, and administer accounts.
          </p>
        </section>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Available actions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Link
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-semibold transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              to="/admin/students"
            >
              <GraduationCap className="h-4 w-4 text-muted" />
              View students
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-semibold transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              to="/admin/results"
            >
              <ClipboardCheck className="h-4 w-4 text-muted" />
              View student results
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-semibold transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              to="/admin/admins"
            >
              <Users className="h-4 w-4 text-muted" />
              Manage admin accounts
            </Link>
            <Link
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-semibold transition hover:bg-surfaceSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              to="/admin/aptitude"
            >
              <BrainCircuit className="h-4 w-4 text-muted" />
              Preview aptitude
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
