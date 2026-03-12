import Button from '@/components/ui/Button';

export default function AdminPagination({ pagination, onPageChange }) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page {pagination.page} of {pagination.pages} - {pagination.total} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
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
