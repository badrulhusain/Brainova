import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { UserPlus, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ThemeAwareSkeleton } from '../../components/ui/theme-toggle';
import { useAuth } from '../../features/auth/AuthProvider';
import { useAdmins, useCreateAdmin, useDeleteAdmin } from '../../features/admin/hooks/useAdmins';
import { createAdminSchema, type CreateAdminValues } from '../../lib/validators/auth';

function AdminRow({
  admin,
  currentAdminId,
}: {
  admin: { id: string; username: string; createdAt: string };
  currentAdminId: string;
}) {
  const deleteAdmin = useDeleteAdmin();
  const isSelf = admin.id === currentAdminId;

  const handleDelete = async () => {
    if (!confirm(`Remove admin "${admin.username}"? This cannot be undone.`)) return;
    try {
      await deleteAdmin.mutateAsync(admin.id);
      toast.success(`Admin "${admin.username}" removed.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove admin.');
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{admin.username}</p>
          <p className="text-xs text-muted">
            Added {new Date(admin.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        {isSelf && (
          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            You
          </span>
        )}
      </div>
      {!isSelf && (
        <button
          aria-label={`Remove ${admin.username}`}
          className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          disabled={deleteAdmin.isPending}
          onClick={() => void handleDelete()}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function AdminsPage() {
  const { user } = useAuth();
  const adminsQuery = useAdmins();
  const createAdmin = useCreateAdmin();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createAdmin.mutateAsync(values);
      toast.success(`Admin "${values.username}" created.`);
      form.reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create admin.');
    }
  });

  const admins = adminsQuery.data ?? [];

  return (
    <main className="bg-background px-4 py-8 text-foreground sm:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        {/* Header */}
        <div>
          <Link
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            to="/admin"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to admin console
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Admin accounts</h1>
          <p className="mt-2 text-sm text-muted">
            Manage who has admin access to the platform. You cannot remove your own account.
          </p>
        </div>

        {/* Add admin button / form */}
        {showForm ? (
          <Card className="p-6">
            <h2 className="mb-5 text-lg font-semibold">Add new admin</h2>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="adm-username">
                  Username
                </label>
                <Input
                  id="adm-username"
                  autoComplete="off"
                  placeholder="e.g. john_doe"
                  aria-invalid={form.formState.errors.username ? 'true' : 'false'}
                  {...form.register('username')}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="adm-password">
                  Password
                </label>
                <Input
                  id="adm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={form.formState.errors.password ? 'true' : 'false'}
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting ? 'Creating…' : 'Create admin'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div>
            <Button
              className="gap-2"
              onClick={() => setShowForm(true)}
              type="button"
            >
              <UserPlus className="h-4 w-4" />
              Add admin
            </Button>
          </div>
        )}

        {/* Admin list */}
        <div className="flex flex-col gap-3">
          {adminsQuery.isLoading ? (
            <>
              {[1, 2, 3].map((n) => (
                <ThemeAwareSkeleton key={n} className="h-16 w-full" />
              ))}
            </>
          ) : adminsQuery.isError ? (
            <Card className="p-5 text-sm text-red-700 dark:text-red-300">
              Failed to load admins.
            </Card>
          ) : admins.length === 0 ? (
            <Card className="py-10 text-center text-sm text-muted">
              No admins found.
            </Card>
          ) : (
            admins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                currentAdminId={user?.id ?? ''}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
