import Button from '@/components/ui/Button';

export default function AdminPagination({ pagination, onPageChange }) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.86),rgba(249,243,233,0.72))] px-4 py-4 shadow-[0_18px_40px_rgba(18,12,7,0.05),inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.84),rgba(11,9,7,0.7))] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Pagination</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Page {pagination.page} of {pagination.pages} - {pagination.total} total records
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1 sm:flex-none"
          variant="secondary"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          className="flex-1 sm:flex-none"
          variant="secondary"
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
