'use client';

import React, { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { MessageSquareText, Search, Trash2 } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import AdminPagination from './AdminPagination';
import { deleteAdminComment } from '@/lib/api';
import useToast from '@/hooks/useToast';
import { getAvatar } from '@/lib/media';

const tableStyles = {
  table: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  headRow: {
    style: {
      minHeight: '54px',
      backgroundColor: 'transparent',
      borderBottomColor: 'rgba(183, 146, 87, 0.18)',
    },
  },
  headCells: {
    style: {
      fontWeight: 700,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: '#8f6b33',
    },
  },
  rows: {
    style: {
      minHeight: '88px',
      backgroundColor: 'transparent',
      borderBottomColor: 'rgba(183, 146, 87, 0.12)',
    },
    highlightOnHoverStyle: {
      backgroundColor: 'rgba(214, 181, 126, 0.08)',
      transitionDuration: '160ms',
    },
  },
  cells: {
    style: {
      paddingTop: '12px',
      paddingBottom: '12px',
    },
  },
};

function truncateText(text, max = 120) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function AdminCommentsTable({ commentsRequest }) {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [postInput, setPostInput] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const loading = commentsRequest.loading;
  const error = commentsRequest.error;
  const comments = commentsRequest.data?.data?.items || [];
  const pagination = commentsRequest.data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const columns = useMemo(
    () => [
      {
        name: 'Commenter',
        grow: 1.2,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAvatar(row.userId)}
              alt={row.userId?.name || 'User'}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-950 dark:text-white">
                {row.userId?.name || 'Unknown user'}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {row.userId?.email || 'No email'}
              </p>
            </div>
          </div>
        ),
      },
      {
        name: 'Post',
        grow: 1.1,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-950 dark:text-white">
              {row.postId?.title || 'Deleted post'}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {row.postId?.slug || '-'}
            </p>
          </div>
        ),
      },
      {
        name: 'Comment',
        grow: 1.9,
        cell: (row) => (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {truncateText(row.content)}
          </p>
        ),
      },
      {
        name: 'Date',
        width: '170px',
        cell: (row) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(row.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        name: 'Actions',
        width: '96px',
        right: true,
        cell: (row) => (
          <Button
            variant="danger"
            size="sm"
            iconOnly
            disabled={deletingId === row._id}
            onClick={() => setPendingDelete(row)}
            aria-label="Delete comment"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [deletingId]
  );

  function applyFilters() {
    commentsRequest.setFilters({
      search: searchInput,
      post: postInput,
    });
    commentsRequest.setPage(1);
  }

  async function confirmDelete() {
    if (!pendingDelete?._id) return;

    try {
      setActionError('');
      setDeletingId(pendingDelete._id);
      await deleteAdminComment(pendingDelete._id);
      setPendingDelete(null);
      await commentsRequest.refetch();
      toast.success('Comment deleted', 'The comment was removed from the discussion.');
    } catch (err) {
      setActionError(err.message || 'Failed to delete comment');
      toast.error('Delete failed', err.message || 'Failed to delete comment');
    } finally {
      setDeletingId('');
    }
  }

  if (loading) {
    return (
      <Card variant="dashboard" hover={false}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Failed to load comments" message={error} />;
  }

  return (
    <Card variant="dashboard" hover={false} className="overflow-hidden">
      <Card.Header className="flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" size="sm">
              Moderation queue
            </Badge>
            <Badge variant="default" size="sm">
              {pagination.total} total comments
            </Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
            Comment moderation
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review discussions, filter by post, and remove problematic comments quickly.
          </p>
        </div>

        <div className="grid w-full gap-3 md:grid-cols-2 2xl:w-auto 2xl:min-w-[820px] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px]">
          <Input
            placeholder="Search comment text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            startAdornment={<Search className="h-4 w-4" />}
          />
          <Input
            placeholder="Filter by post slug or id"
            value={postInput}
            onChange={(event) => setPostInput(event.target.value)}
            startAdornment={<MessageSquareText className="h-4 w-4" />}
          />
          <Button variant="secondary" className="w-full 2xl:w-auto" onClick={applyFilters}>
            Apply
          </Button>
        </div>
      </Card.Header>

      {actionError ? (
        <div className="mt-4">
          <Alert title="Action failed" message={actionError} />
        </div>
      ) : null}

      <div className="mt-6 hidden overflow-hidden rounded-[30px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.82),rgba(250,245,236,0.66))] shadow-[0_22px_56px_rgba(18,12,7,0.06),inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(11,9,7,0.7))] md:block">
        <DataTable
          columns={columns}
          data={comments}
          responsive
          highlightOnHover
          pointerOnHover
          customStyles={tableStyles}
          noDataComponent={
            <span className="py-8 text-sm text-slate-500 dark:text-slate-400">
              No comments found for the current moderation query.
            </span>
          }
        />
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {comments.length === 0 ? (
          <p className="rounded-[22px] border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No comments found for the current moderation query.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(249,243,233,0.8))] p-4 shadow-[0_18px_44px_rgba(18,12,7,0.06)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(11,9,7,0.72))]"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatar(comment.userId)}
                  alt={comment.userId?.name || 'User'}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-950 dark:text-white">
                    {comment.userId?.name || 'Unknown user'}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {comment.postId?.title || 'Deleted post'}
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(250,245,236,0.62))] px-3 py-3 text-sm leading-6 text-slate-600 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.6))] dark:text-slate-300">
                {comment.content}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setPendingDelete(comment)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminPagination pagination={pagination} onPageChange={(nextPage) => commentsRequest.setPage(nextPage)} />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete comment"
        description={`Delete this comment from ${pendingDelete?.userId?.name || 'this user'}? This action cannot be undone.`}
        confirmLabel="Delete comment"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Card>
  );
}
