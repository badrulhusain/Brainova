import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Users } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { useStudents } from '../../features/admin/hooks/useStudents';

const selectClass =
  'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:border-brand-400 dark:focus:ring-brand-500/20';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminStudentsPage() {
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  const studentsQuery = useStudents({
    department: department.trim() || undefined,
    batch: batch.trim() || undefined,
    active:
      activeFilter === 'all'
        ? undefined
        : activeFilter === 'active',
  });

  const students = studentsQuery.data ?? [];
  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;

    return students.filter((student) =>
      [student.name, student.admissionNo, student.department, student.batch]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [search, students]);

  const activeCount = students.filter((student) => student.active).length;
  const inactiveCount = students.length - activeCount;

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div>
          <Link
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            to="/admin"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to admin console
          </Link>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-700 dark:text-brand-300">
                Admin Console
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Students</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                View registered students, admission numbers, departments, batches, and account status.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
              <Users className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-numeric text-2xl font-semibold">{students.length}</p>
                <p className="text-xs text-muted">Students loaded</p>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="font-numeric text-2xl font-semibold">{studentsQuery.isLoading ? '--' : students.length}</p>
            <p className="mt-1 text-sm text-muted">Total</p>
          </Card>
          <Card className="p-5">
            <p className="font-numeric text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
              {studentsQuery.isLoading ? '--' : activeCount}
            </p>
            <p className="mt-1 text-sm text-muted">Active</p>
          </Card>
          <Card className="p-5">
            <p className="font-numeric text-2xl font-semibold text-amber-700 dark:text-amber-300">
              {studentsQuery.isLoading ? '--' : inactiveCount}
            </p>
            <p className="mt-1 text-sm text-muted">Inactive</p>
          </Card>
        </section>

        <section className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students"
              type="search"
              value={search}
            />
          </div>
          <Input
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="Department"
            value={department}
          />
          <Input
            onChange={(event) => setBatch(event.target.value)}
            placeholder="Batch"
            value={batch}
          />
          <select
            className={selectClass}
            onChange={(event) => setActiveFilter(event.target.value as 'all' | 'active' | 'inactive')}
            value={activeFilter}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </section>

        {studentsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <ThemeAwareSkeleton key={n} className="h-16 w-full" />
            ))}
          </div>
        ) : studentsQuery.isError ? (
          <Card className="p-5 text-sm text-red-700 dark:text-red-300">
            Failed to load students. Check your admin access and API connection.
          </Card>
        ) : visibleStudents.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted">
            No students found.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surfaceSoft">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Admission No.</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Batch</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {visibleStudents.map((student) => (
                  <tr key={student.id} className="transition hover:bg-surfaceSoft">
                    <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{student.admissionNo}</td>
                    <td className="px-4 py-3">{student.department ?? 'Not set'}</td>
                    <td className="px-4 py-3">{student.batch ?? 'Not set'}</td>
                    <td className="px-4 py-3">
                      <span className={student.active ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(student.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
