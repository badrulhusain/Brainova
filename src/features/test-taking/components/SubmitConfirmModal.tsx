import { X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

interface SubmitConfirmModalProps {
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmitConfirmModal({
  answeredCount,
  unansweredCount,
  markedCount,
  isSubmitting,
  onConfirm,
  onCancel,
}: SubmitConfirmModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="submit-modal-title"
    >
      <Card className="w-full max-w-md p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold" id="submit-modal-title">
            Submit test?
          </h2>
          <button
            aria-label="Cancel submission"
            className="rounded p-1 text-muted transition hover:bg-surfaceSoft hover:text-foreground"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted">
          Once submitted, you cannot change your answers. Review your progress below.
        </p>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-border rounded-lg border border-border">
          <div className="flex flex-col items-center p-4">
            <dt className="text-xs text-muted">Answered</dt>
            <dd className="mt-1 text-2xl font-semibold text-emerald-600">{answeredCount}</dd>
          </div>
          <div className="flex flex-col items-center p-4">
            <dt className="text-xs text-muted">Not answered</dt>
            <dd className="mt-1 text-2xl font-semibold text-red-600">{unansweredCount}</dd>
          </div>
          <div className="flex flex-col items-center p-4">
            <dt className="text-xs text-muted">Marked</dt>
            <dd className="mt-1 text-2xl font-semibold text-amber-500">{markedCount}</dd>
          </div>
        </dl>

        {unansweredCount > 0 && (
          <p className="mt-4 text-xs text-amber-700 dark:text-amber-400">
            You have {unansweredCount} unanswered question
            {unansweredCount !== 1 ? 's' : ''}. Unanswered questions score 0 marks.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
            Go back
          </Button>
          <Button disabled={isSubmitting} onClick={onConfirm} type="button">
            {isSubmitting ? 'Submitting…' : 'Submit test'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
