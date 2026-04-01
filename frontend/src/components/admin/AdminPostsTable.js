'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Pencil, Search, Trash2, Upload } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormModal from '@/components/ui/FormModal';
import Input from '@/components/ui/Input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Skeleton from '@/components/ui/Skeleton';
import AdminPagination from './AdminPagination';
import { deleteAdminPost, updateAdminPost } from '@/lib/api';
import useToast from '@/hooks/useToast';
import { getPostCover } from '@/lib/media';

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
      minHeight: '82px',
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

function tagsToText(tags) {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
}

function textToTags(text) {
  return text
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function SelectField({ value, onChange, options = [], srLabel }) {
  return (
    <label className="block">
      <span className="sr-only">{srLabel}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-[22px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,247,241,0.86))] px-4 py-3 text-sm text-slate-900 shadow-[0_12px_28px_rgba(18,12,7,0.04),inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-400/55 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.82))] dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminPostsTable({ postsRequest }) {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('all');
  const [deletingId, setDeletingId] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    status: 'draft',
    tags: '',
    content: '',
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [actionError, setActionError] = useState('');

  const loading = postsRequest.loading;
  const error = postsRequest.error;
  const posts = postsRequest.data?.data?.items || [];
  const pagination = postsRequest.data?.data?.pagination || { page: 1, pages: 1, total: 0 };
  const publishedCount = posts.filter((post) => post.status === 'published').length;

  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(coverImageFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverImageFile]);

  const openEdit = (post) => {
    setPendingEdit(post);
    setEditForm({
      title: post.title || '',
      category: post.category || '',
      status: post.status || 'draft',
      tags: tagsToText(post.tags),
      content: post.content || '',
    });
    setCoverImageFile(null);
    setCoverPreview('');
  };

  const columns = useMemo(
    () => [
      {
        name: 'Story',
        grow: 2.1,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPostCover(row)} alt={row.title} className="h-12 w-16 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-950 dark:text-white">{row.title}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {row.author?.name || 'Unknown author'}
              </p>
              <div className="mt-1">
                <Badge variant="default" size="sm">
                  {row.category || row.tags?.[0] || 'general'}
                </Badge>
              </div>
            </div>
          </div>
        ),
      },
      {
        name: 'Status',
        width: '130px',
        cell: (row) => (
          <Badge variant={row.status === 'published' ? 'success' : 'warning'} size="sm">
            {row.status}
          </Badge>
        ),
      },
      {
        name: 'Published On',
        width: '150px',
        cell: (row) => (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        name: 'Actions',
        width: '136px',
        right: true,
        cell: (row) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              onClick={() => openEdit(row)}
              aria-label={`Edit ${row.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              iconOnly
              disabled={deletingId === row._id}
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete ${row.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deletingId]
  );

  const applyFilters = () => {
    postsRequest.setFilters({ search: searchInput, status: statusInput });
    postsRequest.setPage(1);
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id) return;

    try {
      setActionError('');
      setDeletingId(pendingDelete._id);
      await deleteAdminPost(pendingDelete._id);
      setPendingDelete(null);
      await postsRequest.refetch();
      toast.success('Post deleted', 'The story and stored cover media were removed.');
    } catch (err) {
      setActionError(err.message || 'Failed to delete post');
      toast.error('Delete failed', err.message || 'Failed to delete post');
    } finally {
      setDeletingId('');
    }
  };

  const submitEdit = async () => {
    if (!pendingEdit?._id) return;

    try {
      setActionError('');
      setUpdatingId(pendingEdit._id);
      const payload = {
        title: editForm.title,
        category: editForm.category,
        status: editForm.status,
        tags: textToTags(editForm.tags),
        content: editForm.content,
      };

      let requestBody = payload;
      if (coverImageFile) {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('category', payload.category);
        formData.append('status', payload.status);
        formData.append('tags', JSON.stringify(payload.tags));
        formData.append('content', payload.content);
        formData.append('coverImageFile', coverImageFile);
        requestBody = formData;
      }

      await updateAdminPost(pendingEdit._id, requestBody);
      setPendingEdit(null);
      await postsRequest.refetch();
      toast.success('Post updated', 'Story changes were saved successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to update post');
      toast.error('Update failed', err.message || 'Failed to update post');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <Card variant="dashboard" hover={false}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Failed to load posts" message={error} />;
  }

  return (
    <Card variant="dashboard" hover={false} className="overflow-hidden">
      <Card.Header className="flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" size="sm">
              Editorial control
            </Badge>
            <Badge variant="default" size="sm">
              {pagination.total} total stories
            </Badge>
            <Badge variant="success" size="sm">
              {publishedCount} published on this page
            </Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
            Blog management
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, edit, and remove stories with production-grade moderation controls.
          </p>
        </div>

        <div className="grid w-full gap-3 md:grid-cols-2 2xl:w-auto 2xl:min-w-[780px] 2xl:grid-cols-[minmax(0,1fr)_220px_140px]">
          <Input
            placeholder="Search title or content"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            startAdornment={<Search className="h-4 w-4" />}
          />
          <SelectField
            srLabel="Filter posts by status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            options={[
              { value: 'all', label: 'All status' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
            ]}
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
          data={posts}
          responsive
          highlightOnHover
          pointerOnHover
          customStyles={tableStyles}
          noDataComponent={
            <span className="py-8 text-sm text-slate-500 dark:text-slate-400">
              No stories found for the current search and status filters.
            </span>
          }
        />
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {posts.length === 0 ? (
          <p className="rounded-[22px] border border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No stories found for the current search and status filters.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(249,243,233,0.8))] p-4 shadow-[0_18px_44px_rgba(18,12,7,0.06)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(11,9,7,0.72))]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPostCover(post)} alt={post.title} className="h-40 w-full rounded-2xl object-cover" />
              <div className="mt-4 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-950 dark:text-white">{post.title}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {post.author?.name || 'Unknown author'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'} size="sm">
                    {post.status}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {post.category || post.tags?.[0] || 'general'}
                  </Badge>
              </div>
              <div className="mt-4 rounded-[22px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(250,245,236,0.62))] px-3 py-2 text-xs font-medium text-slate-500 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.6))] dark:text-slate-400">
                Published {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" fullWidth onClick={() => openEdit(post)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" fullWidth onClick={() => setPendingDelete(post)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminPagination pagination={pagination} onPageChange={(nextPage) => postsRequest.setPage(nextPage)} />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete post"
        description={`Delete "${pendingDelete?.title || 'this post'}" permanently? This action cannot be undone.`}
        confirmLabel="Delete post"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />

      <FormModal
        open={Boolean(pendingEdit)}
        title="Edit post"
        subtitle="Update publishing state, content, tags, and the stored cover image."
        size="lg"
        confirmLabel="Save post"
        loading={Boolean(updatingId)}
        onConfirm={submitEdit}
        onClose={() => setPendingEdit(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Input
            label="Category"
            helperText="Used in public feed filters and related-story recommendations."
            value={editForm.category}
            onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
          />
          <div className="space-y-1.5">
            <span className="text-[0.8rem] font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-200">
              Status
            </span>
            <SelectField
              srLabel="Select post status"
              value={editForm.status}
              onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
            />
          </div>
          <Input
            label="Tags"
            helperText="Comma-separated tags for content categorization."
            value={editForm.tags}
            onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
          />
        </div>

        <RichTextEditor
          label="Content"
          value={editForm.content}
          onChange={(value) => setEditForm((prev) => ({ ...prev, content: value }))}
          helperText="Rich formatting is saved as sanitized HTML in the post content."
          placeholder="Refine the article body..."
          minHeightClass="min-h-[280px]"
        />

        <div className="space-y-1.5">
          <span className="text-[0.8rem] font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-200">
            Cover image
          </span>
          <label className="flex cursor-pointer items-center gap-2 rounded-[24px] border border-dashed border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,245,236,0.7))] px-4 py-3 text-sm text-slate-600 transition hover:border-amber-300 hover:shadow-[0_14px_30px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.6))] dark:text-slate-300">
            <Upload className="h-4 w-4" />
            <span className="truncate">{coverImageFile?.name || 'Upload replacement cover image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {pendingEdit ? (
          <div className="rounded-[26px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,245,236,0.68))] p-4 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))]">
            <p className="mb-3 font-medium text-slate-950 dark:text-white">Cover preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview || getPostCover(pendingEdit)}
              alt="Post cover preview"
              className="h-48 w-full rounded-2xl object-cover"
            />
          </div>
        ) : null}
      </FormModal>
    </Card>
  );
}
